var map;
var isDirecting = false;
var isCurrent = false;
var curOri;
//hover show text
$("#button_search").hover(function() {
  $("#search-text").show();
}, function() {
  $("#search-text").hide();
});
$("#button_direct").hover(function() {
  $("#direct-text").show();
}, function() {
  $("#direct-text").hide();
});
$("#button_location").hover(function() {
  $("#locate-text").show();
}, function() {
  $("#locate-text").hide();
});
$("#button_swap").hover(function() {
  $("#swap-text").show();
}, function() {
  $("#swap-text").hide();
});
//==============================
$(document).ready(function(){
  $(".hidden").hide();
  map = new GMaps({
    el: '#map',
    lat: 10.7626391,
    lng: 106.6820268
  });
  map.setContextMenu({
    control: 'map',
    options: [{
      title: 'Địa điểm của bạn',
      name: 'add_marker',
      action: function(e){
        console.log(e.latLng.lat());
        console.log(e.latLng.lng());
        this.addMarker({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          title: 'Địa điểm của bạn'
        });
        this.hideContextMenu();
      }
    }, {
      title: 'Center here',
      name: 'center_here',
      action: function(e){
        this.setCenter(e.latLng.lat(), e.latLng.lng());
      }
    }]
  });
  map.setContextMenu({
    control: 'marker',
    options: [{
      title: 'Center here',
      name: 'center_here',
      action: function(e){
        this.setCenter(e.latLng.lat(), e.latLng.lng());
      }
    }]
  });
});
//=======================================
// search
$("#button_search").click(function(event) {
    var str = $("#inputAddress").val();
    if(str !== "" && isDirecting === false){
      findAddress(str);
    }
    //Nếu đang chỉ đường thì kích hoạt chỉ đường
    if(isDirecting == true){
      map.removeMarkers();
      var des = $("#inputDestinations").val();
      directing(str,des);
    }
});
$("#inputAddress").keyup(function(event) {
  var str = $("#inputAddress").val();
  if(event.keyCode == 13 && str !== "")
  {
    findAddress(str);
  }
});
function findAddress(str){
  GMaps.geocode({
    address: str,
    callback: function(results,status){
      if(status == 'OK'){
        var latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        map.addMarker({
          lat: latlng.lat(),
          lng: latlng.lng()
        });
      }
    }
  });
};
//=========================================
//geolocation
$("#button_location").click(function(event) {
  GMaps.geolocate({
    success: function(position){
      map.setCenter(position.coords.latitude, position.coords.longitude);
      map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      curOri = position;
      isCurrent = true;
      $("#inputAddress").val(position.coords.latitude, position.coords.longitude);
    },
    error: function(error){
      alert('Geolocation failed: '+error.message);
    },
    not_supported: function(){
      alert("Your browser does not support geolocation");
    },
  });
});
//============================================
function directing(ori,des){
  if(isCurrent == true){
    GMaps.geocode({
          address: des,
          callback: function(results,status){
            if(status == 'OK'){
              var desPos = results[0].geometry.location;
              map.renderRoute({
                origin: [curOri.coords.latitude, curOri.coords.longitude],
                destination: [desPos.lat(), desPos.lng()],
                travelMode: 'driving',
                strokeColor: '#FE0000',
                strokeOpacity: 0.6,
                strokeWeight: 6
              },{panel:'#direction',draggable:true});
            }
            else{
              alert("Can't find destination!");
            }
          }
        });
  }
  else{
   GMaps.geocode({
      address: ori,
      callback: function(results,status){
        if(status == 'OK'){
          var oriPos = results[0].geometry.location;
          map.setCenter(oriPos.lat(), oriPos.lng());
          GMaps.geocode({
            address: des,
            callback: function(results,status){
              if(status == 'OK'){
                var desPos = results[0].geometry.location;
                map.renderRoute({
                  origin: [oriPos.lat(), oriPos.lng()],
                  destination: [desPos.lat(), desPos.lng()],
                  travelMode: 'driving',
                  strokeColor: '#FE0000',
                  strokeOpacity: 0.6,
                  strokeWeight: 6
                },{panel:'#direction',draggable:true});
              }
              else{
                alert("Can't find destination!");
              }
            }
          });
        }
      }
    }); 
  }
  
}
//-------------------------------
//Nhan direction sẽ hiện và ẩn input destination đồng thời bật tắt chế độ chỉ đường
$("#button_direct").click(function(event) {
  if($(".hidden").is(":hidden")){
    $(".hidden").show();
    $("#inputAddress").attr({
      placeholder: 'Enter starting..',
    });
    isDirecting = true;
  }else{
    $(".hidden").hide();
    $("#inputAddress").attr({
      placeholder: "Search...",
    });
    isDirecting = false;
  }
});
