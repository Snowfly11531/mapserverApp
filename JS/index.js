$selection={};
$properties=[];
$features=[];

$vectorSource=new ol.source.Vector({
    format:new ol.format.GML2(),
    loader: function($extent) {
        $url = "http://127.0.0.1/cgi-bin/mapserv.exe?map=/ms4w/Apache/htdocs/WMServer/map/index.map&" +
            "service=wfs&version=1.1.0&request=getfeature&typename=vectorSheng&maxfeatures=100&OUTPUTFORMAT=gml2&"+
            "crsname=EPSG:4326";
        $xhr = new XMLHttpRequest();
        $xhr.open('GET', $url);
        $onError = function() {
            $vectorSource.removeLoadedExtent($extent);
        }
        $xhr.onerror = $onError;
        $xhr.onload = function() {
            if ($xhr.status == 200) {
                $vectorSource.addFeatures(
                    $vectorSource.getFormat().readFeatures($xhr.responseText));
                $features=$vectorSource.getFeatures();
                $properties=[];
                if($features.length>0) {
                    $properties = $features[0].getProperties();
                }
                $table="<table style='display: none'><tr>";
                for($property in $properties){
                    $table+="<th>"+$property+"</th>";
                }
                $table+="</tr>";
                for($i=0;$i<$features.length;$i++){
                    $table+="<tr>";
                    for($property in $properties){
                        $table+="<td>"+$features[$i].get($property)+"</td>";
                    }
                    $table+="</tr>";
                }
                $table+="</table>";
                $("#footerAdd").html($table);
            } else {
                $onError();
            }
        }
        $xhr.send();
    }
}); //加载wfs矢量图层

$vectorTile=new ol.layer.Vector({
    source:$vectorSource,
    style:function($feature) {
        $selected=!!$selection[$feature.get('gid')];
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: $selected? 'rgba(0,255,0,0.8)':'rgba(255,255,255,0.3)',
                width: $selected? 4 : 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(80,80,80,0.8)'
            }),
            text:new ol.style.Text({
                font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
                size:40,
                placement: 'center',
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.8)'
                }),
                text:$feature.get('name')
            })
        })
    },
    projection:'EPSG:4326'
});

$map=new ol.Map({
    layers:[
        new ol.layer.Tile({
            source:new ol.source.OSM()
        }),
        $vectorTile
    ],
    target:'map',
    view:new ol.View({
        center:[110,30],
        maxZoom:19,
        minZoom:4,
        zoom:6,
        projection:'EPSG:4326'
    })
});

$("header li").hover(  //头部标签鼠标覆盖时着色
    function () {
        $img=$(this).find('img');
        $src=$img.attr('src');
        $num=$src.lastIndexOf(".");
        $src=$src.substring(0,$num)+"_blue.png";
        $img.attr('src',$src);
    },
    function () {
        $img=$(this).find('img');
        $src=$img.attr('src');
        $num=$src.lastIndexOf(".");
        $src=$src.substring(0,$num-5)+".png";
        $img.attr('src',$src);
    }
);
$("header li").bind('click',function ($event) {
    $event.stopPropagation();
})

$("#map").bind("pointermove",function (event) {
    var t=$map.getEventCoordinate(event);
    $("#XY").text(ol.coordinate.toStringXY(t,4));
});//坐标显示

$("#map").bind("click",function (event) {
    if(event.clientY<=100){
        $("header").slideToggle(300);
    }
});//头部放下

$("header").bind("click",function () {
    $(this).slideToggle(300);
});//头部收起

$("#footerAdd").niceScroll({
    cursorborder:"",
    cursorcolor:"#FFF",
    boxzoom:true
}); //底部滚动条设计

$map.on('click',function (event) {
    $selectedFeatures=$map.getFeaturesAtPixel(event.pixel);
    $selection={};
    if(!$selectedFeatures){
        $vectorTile.setStyle($vectorTile.getStyle());
    }
    $selectedFeature=$selectedFeatures[0];
    $selection[$selectedFeature.get('gid')]=true;
    $vectorTile.setStyle($vectorTile.getStyle());
    $("#footerAdd table").children().children('tr').children('td').removeClass('selected');
    $selectedId=$selectedFeature.get('gid');
    for($i=0;$i<$features.length;$i++){
        $id=$features[$i].get('gid');
        if($selectedId==$id){
            $("#footerAdd table").children().children('tr').eq($i+1).children('td').addClass('selected');
        }
    }
}); //点击图层单选

$("#tableButton").bind('click',function () {
    if($("#footerAdd table").css('display')=='none'){
        $("#footerAdd").slideToggle(300);
        $("#footerAdd table").css({'display':'inline'});
    }else{
        $("#footerAdd table").css({'display':'none'});
        $("#footerAdd").slideToggle(300);
    }
});


