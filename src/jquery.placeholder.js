/**
 * @file        基于jQuery实现的针对IE6~9表单placeholder属性的兼容处理
 * @version     1.0.0
 * @update      2014/12/10
 * @author      龙泉<yangtuan2009@126.com>
 */

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD module
        define(['jquery'], factory);
    }
    else if(typeof module !== "undefined" && module.exports) {
        // Node/CommonJS
        // Seajs build
        factory(require('jquery'));
    }
    else {
        // 浏览器全局模式
        factory(jQuery);
    }

})(function ($) {

    $.placeholderColor = $.placeholderColor || "#c1c1c1";
    $.placeholderHideFocus = $.placeholderHideFocus || false;

    $.fn.placeholder = function() {

        if(support_placeholder) return this;

        return this.each(function(i, ele){

            var $ele = $(ele);

            if($ele.data("didPlaceholder")){
                $ele.prev("ins").html($ele.attr("placeholder"));
                return;
            }
            $ele.data("didPlaceholder", true);

            var $holder = $ele.before("<ins style='position:absolute;z-index:5;display:none;text-decoration:none;'>" + $ele.attr("placeholder") + "</ins>").prev(),
                isTextarea = ele.tagName.toLowerCase() === "textarea",
                width = $ele.width(),
                height = isTextarea ? parseInt($ele.css("line-height")) : $ele.outerHeight(),
                paddingLeft = parseInt($ele.css("padding-left")),
                paddingRight = parseInt($ele.css("padding-right")),
                initBorder = ($ele.outerWidth() - width - paddingLeft - paddingRight) / 2,
                paddingTop = isTextarea && !isNaN(height) ? parseInt($ele.css("padding-top")) + initBorder : 0,
                hideFocus = $ele.attr("data-placeholder-hidefocus") || $.placeholderHideFocus;

            setTimeout(function(){
                //通过延时处理防止IE9浏览器在网页加载时读取缓存内容而导致占位文本未隐藏的情况
                $ele.val() === "" && $holder.css("display", "inline-block");  
            }, 0);

            $holder.css({
                "width": width,
                "height": height,
                "line-height": height + "px",
                "padding-left": paddingLeft + initBorder + "px",
                "padding-right": paddingRight + initBorder + "px",
                "padding-top": paddingTop + "px",
                "margin-left": $ele.css("margin-left"),
                "margin-top": ($ele.outerHeight(true) <= $ele.parent().height()) ? $ele.css("margin-top") : 0,
                "font-family": $ele.css("font-family"),
                "font-size": $ele.css("font-size"),
                "font-weight": $ele.css("font-weight"),
                "font-style": $ele.css("font-style"),
                "text-align": $ele.css("text-align"),
                "text-indent": $ele.css("text-indent"),
                "color": $ele.attr("data-placeholder-color") || $.placeholderColor
            });

            $holder.on("click", function(){
                $ele.focus();
            });

            hideFocus = hideFocus === "false" ? false : hideFocus;
            
            hideFocus && $ele.on("focus", function(){
                $ele.val() === "" && $holder.hide();
            });

            $ele.on(changeEvent + " keyup blur", function(){
                (!hideFocus || document.activeElement !== ele) && $holder.css("display", $ele.val() === "" ? "inline-block" : "none");
            });
        });
    };

    //相关判断
    var eleInput = document.createElement("input"),
        support_placeholder = "placeholder" in eleInput,
        changeEvent = "oninput" in eleInput ? "input" : "propertychange";

    //改写jQuery中的attr函数和val函数以兼容placeholder
    if(!support_placeholder){

        var oldAttr = $.fn.attr;
        $.fn.attr = function(){
            var arg1 = arguments[0], arg2 = arguments[1];
            if(arg1 === "placeholder" && typeof(arg2) === "string" || $.isPlainObject(arg1) && arg1["placeholder"]){
                this.each(function(i, ele){
                    setTimeout(function(){
                        $(ele).placeholder();
                    }, 0);
                });
            }
            return oldAttr.apply(this, arguments);
        };

        var oldVal = $.fn.val;
        $.fn.val = function(){
            if(arguments.length > 0){
                this.each(function(i, ele){
                    var $ele = $(ele), $holder = $ele.prev("ins");
                    $holder.length > 0 && setTimeout(function(){
                        $holder.css("display", $ele.val() === "" ? "inline-block" : "none");
                    }, 0);
                });
            }
            return oldVal.apply(this, arguments);
        };
    }

});