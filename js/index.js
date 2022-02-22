// 啟用mitt
const emitter = mitt();
// JavaScript控制modal
let myModal = {};

// veeValidate rules規範
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
// 多國語系外部資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為輸入字元立即進行驗證
});

const app = Vue.createApp({
    data(){
        return {
            api: {
                url: "https://vue3-course-api.hexschool.io/v2",
                path: "vue2022ron",
            },
            signinData: {
                username: "hpleain@gmail.com",
                password: "Vueapi812",
            },
            tempProducts: [],
            productLoading: false
        }
    },
    mounted(){
        this.loggin();
    },
    methods: {
        // 登入
        loggin(){
            axios.post(`${this.api.url}/admin/signin` , this.signinData)
            .then((res) => {
                const { token, expired } = res.data;
                // 把token、expired存入cookie
                document.cookie = `myToken = ${token}; expires = ${ new Date(expired) };`;
                // 檢查登入狀態
                this.checkLogin();
            })
            .catch((err) => {
                alert('登入失敗 , 請檢查帳號、密碼');
            })
        },
        // 檢查登入狀態
        checkLogin(){
            // 取得存在cookie的token資訊
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/,"$1");
            // 把token加入axios的headers授權資料
            axios.defaults.headers.common["Authorization"] = token;
            axios.post(`${this.api.url}/api/user/check`)
            .then((res) => {
                // 檢查登入狀態，成功的話取得商品資料
                this.getData();
            })
            .catch((err) => {
                alert('登入資訊異常，請重新登入');
            })
        },
        // 取API資料
        getData(page = 1){
            // 開始取商品資料
            this.productLoading = true;
            // 用query的方式，代出商品資料
            // /?page=${ 頁數 }
            axios.get(`${this.api.url}/api/${this.api.path}/admin/products/?page=${page}`)
            .then((res) => {
                // 取得api商品資料，存放tempProducts，準備渲染畫面
                this.tempProducts = res.data.products
                this.$emit('emit-product' , res.data.products)
                // 結束取商品資料
                this.productLoading = false;
            })
            .catch((err) => {
                alert("取得資料失敗");
            })
        },
    }
});
app.use(VueLoading.Plugin);

// 子元件product
app.component('product' , {
    data(){
        return{
            modalProduct: []
        }
    },
    props: [ 'propsProduct' ],
    mounted() {
        
    },
    methods: {
        // 點擊查看更多
        openModal(item) {
            // 發送openModal事件to productModal
            // 代入item.id
            emitter.emit('openModal' , item.id);
        },
        productToCart(item) {
            emitter.emit('productToCart' , item.id);
        }
    },
    template: '#product-template'
});

// 子元件cart
app.component('cart' ,{
    data() {
        return {
            // 修改購物車單項商品數量需要的資料
            modifyCart: {
                product_id: '',
                qty: 0
            },
            // 存放購物車內的商品資料
            cartProducts: [],
            loader: {},
            finalTotal: 0,
            total: 0,
            cartRefs: {},
        }
    },
    // productLoading => 根元件取得商品資料的狀態
    props: [ 'api' , 'productLoading'],
    watch: {
        productLoading() {
            if(this.productLoading === true){
                this.onLoading();
            }else{
                this.offLoading();
            }
        }
    },
    mounted() {
        // 元件mounted時期，先取得購物車資料
        this.getCart();
        
        // 監聽addToCart事件，接收from porductModal（已經postCart to API完成）
        emitter.on('addToCart' , () =>{
            this.getCart();
        });
        // 監聽form-loading事件，依據status控制vee-loading
        emitter.on('form-loading' , (status) =>{
            if(status === true){
                this.onLoading();
            }else{
                this.offLoading();
                // 送出訂單後，重新取得購物車資料
                setTimeout(() => {
                    this.getCart();
                },1000);
            }
        })
    },
    methods: {
        // 取得購物車資料
        getCart() {
            // onLoading
            this.onLoading();
            axios.get(`${this.api.url}/api/${this.api.path}/cart`)
            .then((res) => {
                // 取得購物車內的資料，賦予this.cartProducts
                this.cartProducts = res.data.data.carts;
                // 發送cartStatus事件，把購物車的資料長度發送出去
                emitter.emit('cartStatus' , this.cartProducts.length);
                // total
                this.total = res.data.data.total;
                // finalTotal
                this.finalTotal = res.data.data.final_total;
                this.offLoading();
            })
            .catch((err) => {
                alert("取得資料失敗");
                this.offLoading();
            })
        },
        // 清空購物車
        clearCart() {
            axios.delete(`${this.api.url}/api/${this.api.path}/carts`)
            .then((res) => {
                // 清空購物車再重新取得購物車資料
                this.getCart();
            })
            .catch((err) => {
                alert("修改資料失敗");
            })
        },
        // 修改購物車單項商品數量
        changeItem(item) {
            this.modifyCart.product_id = item.id;
            this.modifyCart.qty = item.qty;
            axios.put(`${this.api.url}/api/${this.api.path}/cart/${item.id}` , { 
                data: this.modifyCart
            })
            .then((res) => {
                // 修改完重新取得購物車資料
                this.getCart()
            })
            .catch((err) => {
                alert("修改資料失敗");
            })
        },
        // 刪除購物車單項商品
        delItem(item) {
            axios.delete(`${this.api.url}/api/${this.api.path}/cart/${item.id}`)
            .then((res) => {
                this.getCart();
            })
            .catch((err) => {
                alert("刪除資料失敗");
            })
        },
        // 開始vue-loading
        // 這邊不代入參數
        onLoading(fullPage , refs) {
            this.loader = this.$loading.show({
                // Optional parameters
                // 若loading圖示只在某元素內出現，isFullPage: false
                isFullPage: fullPage ? true : false,
                // isFullPage = false，container: this.$refs DOM元素
                container: this.isFullPage ? null : refs,
                canCancel: true,
                onCancel: this.onCancel,
                loader: 'dots',
                width: 32,
                height: 32,
                backgroundColor: '#ffffff',
                opacity: 0.5,
            });
        },
        // 結束vue-loading
        offLoading() {
            setTimeout(() => {
                this.loader.hide()
            })
        }
    },
    template: '#cart-template'
});
// 訂單
app.component('order-form' , {
    data() {
        return {
            // 購物車是否為空
            cartEmpty: false,
            // 訂單資料
            orderData: {
                user: {
                    name: "",
                    email: "",
                    tel: "",
                    address: ""
                },
                message: ""
            },
            // 訂單確認
            orderCheck: false,
        }
    },
    props:[ 'api' ],
    mounted() {
            // 監聽cartStatus事件，接收購物車的資料長度，判斷購物車是否為空的
            emitter.on('cartStatus' , (length) => {
            // 購物車的資料長度大於0，this.cartEmpty = false(購物車有商品)
            this.cartEmpty = length > 0 ? false : true;
            });
    },
    methods: {
        // 送出submit
        onSubmit() {
            // 發送form-loading事件，啟動vee-loading
            emitter.emit('form-loading' , true);
            setTimeout(() => {
            },2000)
            axios.post(`${this.api.url}/api/${this.api.path}/order` , { data: this.orderData })
            .then((res) => {
                // 送出submit成功，清除v-form資料
                this.$refs.form.resetForm();
                emitter.emit('form-loading' , false);
            })
            .catch((err) => {
                alert("送出訂單失敗");
            })
        },
        // veeValidate rules規範
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        }
    },
    template: '#form-template'
});
// 註冊表單驗證元件
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);


// 子元件productModal
app.component('productModal' ,  {
    data() {
        return {
            // 存放用id取得的商品資料
            productInfo: {},
            // 增加到商品到購物車要傳送的資料
            toCart: {
                product_id: '',
                qty: 0
            },
        }
    },
    props: [ 'api' ],
    mounted() {
        // 取得modal的DOM元素id
        myModal = new bootstrap.Modal(document.querySelector(`#${this.$refs.modalDom.id}`));
        
        // 監聽openModal事件。接收商品ID from productModal
        emitter.on('openModal' , (id) => {
            this.productInfo = {};
            // 再用id取得資料
            this.getData(id);
        });
        // 監聽productToCar事件。接收商品ID from product
        emitter.on('productToCart' , (id) =>{
            this.postData(id);
            this.postCart();
        });
    },
    beforeUnmount() {
        emitter.off('openModal');
    },
    methods: {
        // 增加到購物車（互動視窗modal）
        addToCart(){
            // 關閉modal
            myModal.hide();
            // post cart to API
            this.postCart();
        },
        // post到API要傳送的資料結構
        postData(id , num =1) {
            // 把id、預設數量，加到toCard
            this.toCart.product_id = id;
            this.toCart.qty = num;
        },
        // 用id取得商品資料
        getData(id){
            axios.get(`${this.api.url}/api/${this.api.path}/product/${id}`)
            .then((res) => {
                // 取得對應id商品資料，存放productsInfo
                this.productInfo = res.data.product;
                this.postData(id);
                // 資料都準備好，才打開modal
                myModal.show(); 
            })
            .catch((err) => {
                alert("取得資料失敗");
            })
        },
        // post資料到購物車
        postCart(){
            axios.post(`${this.api.url}/api/${this.api.path}/cart` , { data: this.toCart})
            .then((res) => {
                // 發送'addToCart'事件，通知cart從api get資料渲染
                emitter.emit('addToCart');
            })
            .catch((err) => {
                alert("取得資料失敗");
            })
        },
    },
    template: '#modal'
})

app.mount('#app');
