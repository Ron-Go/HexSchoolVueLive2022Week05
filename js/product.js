import productModal from "../js/modal.js";



export default {
    data(){
        return{
            myModal: {},
            modalProduct: []
        }
    },
    props: [ 'propsProduct' ],
    components:{
        productModal
    },
    mounted() {
        // 查看更多產品內容（modal互動視窗）
        this.myModal = new bootstrap.Modal(document.querySelector('#productModal'));
        
    },
    methods: {
        openModal(item) {
            this.modalProduct = item;
            this.myModal.show();
        }
    },
    template: 
    `<table class="table align-middle">
            <thead>
                <tr>
                    <th>圖片</th>
                    <th>商品名稱</th>
                    <th>價格</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item , key) in propsProduct" :key="'item' + key">
                    <template v-if=" key < 2">
                        <td style="width: 200px">
                            <div  class="overflow-hidden" style="height: 100px; background-size: cover; background-position: center">
                                <img class="img-fluid" :src="item.imageUrl" alt="" />
                            </div>
                        </td>
                        <td>
                            {{ item.title }}
                        </td>
                        <td>
                            <del class="h6">原價 {{ item.origin_price }} 元</del>
                            <div class="h5 text-danger">破盤價只要 {{ item.price }} 元</div>
                        </td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-secondary"
                                @click="openModal(item)" >
                                <i class="fas fa-spinner fa-pulse"></i>
                                查看更多
                                </button>
                                <button type="button" class="btn btn-outline-danger">
                                <i class="fas fa-spinner fa-pulse"></i>
                                加到購物車
                                </button>
                            </div>
                        </td>
                    </template>
                </tr>
            </tbody>
    </table>
    <product-modal :productInfo="modalProduct" @emit-close-modal="myModal.hide()"></product-modal>
    `
};