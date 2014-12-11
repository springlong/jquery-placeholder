/**
 * @file        基于jQuery实现的针对IE6~9的表单placeholder属性的兼容处理
 * @version     1.0.0
 * @update      2014/12/05
 * @author      龙泉<yangtuan2009@126.com>
 */

(function($)
{
    /**
     * 用于提供设置占位文本的颜色值
     * @type {String}
     */
    $.placeholderColor = $.placeholderColor || "#c1c1c1";

    /**
     * 表单元素placeholder属性的兼容处理
     */
    $.fn.placeholder = function()
    {
        if(support_placeholder) return this;    //如果浏览器支持placeholder属性则无需处理兼容（该判断主要针对外部调用时的情况）
        doCheckValue && checkValue();           //首次执行占位文本框的值的检测工作，防止通过程序重置文本框为空的情况下恢复占位状态

        return this.each(function(index, ele){

            var $ele = $(ele),
                value = ele.value,
                placeholder = ele.getAttribute("placeholder"),
                holderColor = ele.getAttribute("data-holderColor") || $.placeholderColor;

            if(ele.isHolderState !== undefined) return;  //避免重复执行

            ele.oldColor = ele.style.color;
            ele.holderColor = holderColor;
            ele.isHolderState = false;
            holderEles.push(ele);

            if(value === "" || value === placeholder){
                setPlaceHolder(ele);
            }
            
            //处于占位文本状态时，点击或者取得焦点时定位光标到开头处
            $ele.on("focus click", function(){
                this.isHolderState && setTextPosition(this, 0);
            });

            //处于占位文本状态时，不响应退格、delete以及其他定位按键，同时遇到功能按键不清空文本框
            //如果开始输入其他文本，则取消占位状态
            $ele.on("keydown", function(e){

                if(this.isHolderState){
                    var keyCode = "," + e.keyCode + ",";
                    if(",8,46,33,34,35,36,37,38,39,40,27,".indexOf(keyCode) >= 0){
                        e.preventDefault();
                        return;
                    }
                    if(",9,16,17,18,19,20,45,".indexOf(keyCode) < 0 && !(this.tagName.toLowerCase() === "input" && e.keyCode === 13)){
                        this.value = "";
                        this.style.color = this.oldColor;   
                    }
                }
            });

            //通过退格和delete按键使得文本框为空时，重置占位文本
            //文本框一旦输入其他文本，则将文本框占位状态标识为false
            $ele.on("keyup", function(e){

                var value = this.value;

                if(value === "" && (e.keyCode === 8 || e.keyCode === 46)){
                    setPlaceHolder(this);
                    setTextPosition(this, 0);
                }
                else if(value !== "" && value !== this.getAttribute("placeholder")){
                    this.isHolderState = false;
                }
            });
        });
    };

    /**
     * 定位文本输入框的光标位置
     * @param {DOMElement} ele 文本输入框
     * @param {Number} pos 光标位置
     */
    function setTextPosition(ele, pos)
    {
        if(ele.setSelectionRange){
            //针对IE9+、Chrome、Firefox等有效
            setTimeout(function(){
                ele.setSelectionRange(pos, pos);
                ele.focus();
            }, 0);
        }else if(ele.createTextRange){
            //针对IE6~8有效
            var rng = ele.createTextRange();
            rng.move('character', pos);
            rng.select();
        }
    };

    /**
     * 检测占位文本框的值
     * @return {undefined}
     */
    function checkValue()
    {
        doCheckValue = false;
        var i = 0, len = holderEles.length, ele;
        for(; i < len; ){
            if((ele = holderEles[i++]).value === ""){
                setPlaceHolder(ele);
                document.activeElement === ele && setTextPosition(ele, 0);
            }
        }
        setTimeout(checkValue, 100);
    }

    /**
     * 设置文本框的占位内容
     * @param {DOMElement} ele 文本输入框
     */
    function setPlaceHolder(ele)
    {
        ele.value = ele.getAttribute("placeholder");
        ele.style.color = ele.holderColor;
        ele.isHolderState = true;
    }

    //执行占位文本的判断处理
    var eleInput = document.createElement("input"),
        support_placeholder = "placeholder" in eleInput,
        holderEles = [],
        doCheckValue = true;

    eleInput = null;  //释放DOM元素创建占用的资源（针对IE低版本浏览器）

    !support_placeholder && $(function($){

        $("input[placeholder],textarea[placeholder]").placeholder();
    });

})(jQuery);