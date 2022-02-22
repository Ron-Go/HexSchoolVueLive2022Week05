

export default{
    name: "cart",
    template: `
    <div class="text-end">
                <button class="btn btn-outline-danger" type="button" @click="onLoading">清空購物車</button>
            </div>
            <!-- vue-loading只在某個元素內出現，該元素要設定position-relative -->
            <table class="table align-middle position-relative" ref="cart">
                <thead>
                    <tr>
                        <th></th>
                        <th>品名</th>
                        <th style="width: 150px">數量/單位</th>
                        <th>單價</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item , key) in cartProducts" :key="'item' + key">
                        <tr>
                            <td>
                                <button type="button" class="btn btn-outline-danger btn-sm"
                                @click="delItem(item)">
                                    <i class="fas fa-spinner fa-pulse"></i>
                                    x
                                </button>
                            </td>
                            <td>
                                {{ item.product.title }}
                                <div class="text-success">
                                    已套用優惠券
                                </div>
                            </td>
                            <td>
                                <div class="input-group input-group-sm">
                                    <div class="input-group mb-3">
                                        <input min="1" type="number" class="form-control" v-model="item.qty" @change="changeItem(item)">
                                        <span class="input-group-text" id="basic-addon2">{{ item.product.unit }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="text-end">
                                <small class="text-success">折扣價：</small>
                                {{  }}
                            </td>
                        </tr>
                    </template>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end">總計</td>
                        <td class="text-end">{{ total }}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end text-success">折扣價</td>
                        <td class="text-end text-success">{{ finalTotal }}</td>
                    </tr>
                </tfoot>
            </table>
    `
}