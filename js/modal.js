
export default {
    props: [ 'productInfo' ],
    mounted() {
        
    },
    methods: {
        addToCart(){
            // 通知外層關閉modal
            this.$emit('emit-close-modal');
        }
    },
    template: 
    `
<div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">{{ productInfo.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-4">
                        <img class="img-fluid" :src="productInfo.imageUrl" alt="" />
                    </div>
                    <div className="col-8">
                        <h4><span class="badge bg-secondary">{{ productInfo.category }}</span></h4>
                        <p>產品內容：{{ productInfo.description }}</p>
                        <p>產品描述：{{ productInfo.content }}</p>
                        <del class="h6">原價 {{ productInfo.origin_price }} 元</del>
                        <h5 class="h5 text-danger">破盤價只要 {{ productInfo.price }} 元</h5>
                        <div className="input-group">
                            <button type="" class="pe-none btn btn-primary">數量</button>
                            <input class="form-control" max="10" min="1" type="number" value="1"/>
                            <button type="button" class="btn btn-primary" @click="addToCart">加入購物車</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer"></div>
        </div>
    </div>
</div>
    `
}