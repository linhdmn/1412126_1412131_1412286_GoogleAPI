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
    lng: 106.6820268,
    click: function(event) {
      clickOnMap(event);
    }
  });
  map.setContextMenu({
    control: 'map',
    options: [{
      title: 'Add maker here',
      name: 'add_marker',
      action: function(e){
        console.log(e.latLng.lat());
        console.log(e.latLng.lng());
        this.addMarker({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          title: 'Add maker here'
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
});
//=======================================
$(".btn").click(function(event) {
  //
  //nhan button search
  if(this.id=="button_search"){
    var str = $("#inputAddress").val();
    if(str !== "" && isDirecting == false){
      findAddress(str);
    }
    //Nếu đang chỉ đường thì kích hoạt chỉ đường
    if(isDirecting == true){
      map.removeMarkers();
      var des = $("#inputDestinations").val();
      directing(str,des);
    }
  }
// nhan show location
  if(this.id == "button_location"){
    GMaps.geolocate({
      success: function(position){
        map.setCenter(position.coords.latitude, position.coords.longitude);
        map.addMarker({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        curOri = [position.coords.latitude, position.coords.longitude];
        isCurrent = true;
        $("#inputAddress").val(curOri);
      },
      error: function(error){
        alert('Geolocation failed: '+error.message);
      },
      not_supported: function(){
        alert("Your browser does not support geolocation");
      },
    });
  }
//-------------------------------
//Nhan direction sẽ hiện và ẩn input destination đồng thời bật tắt chế độ chỉ đường
  if(this.id == "button_direct"){
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
  }
// nhan swap doi value cua des và origin
  if(this.id == "button_swap"){
    var str = $("#inputAddress").val();
    var des = $("#inputDestinations").val();
    $("#inputAddress").val(des);
    $("#inputDestinations").val(str);
    isCurrent = false;
  }
  //
});
$("#inputAddress").keyup(function(event) {
  var str = $("#inputAddress").val();
  if(event.keyCode == 13 && str !== "" && isDirecting === false)
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
//================================
function clickOnMap(event){
  console.log(event.placeId);
  // if(event.placeId){
  //   $.ajax({
  //     url: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + event.placeId + 
  //     '&key=AIzaSyCqG55x6-7BVevi2doMzzPFqmmATL55iPU',
  //     type: 'GET',
  //     contentType:'text/plain',
  //     xhrFields: {
  //     // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
  //     // This can be used to set the 'withCredentials' property.
  //     // Set the value to 'true' if you'd like to pass cookies to the server.
  //     // If this is enabled, your server must respond with the header
  //     // 'Access-Control-Allow-Credentials: true'.
  //     withCredentials: false
  //     },

  //     headers: {
  //       // Set any custom headers here.
  //       // If you set any non-simple headers, your server must include these
  //       // headers in the 'Access-Control-Allow-Headers' response header.
  //     },

  //     success: function() {
  //       console.log("success");
  //       // Here's where you handle a successful response.
  //     },

  //     error: function() {
  //       console.log("error");
  //       // Here's where you handle an error response.
  //       // Note that if the error was due to a CORS issue,
  //       // this function will still fire, but there won't be any additional
  //       // information about the error.
  //     }
  //   });  
  // }
}

//============================================
function directing(ori,des){
  console.log($("#input_mode").val());
  if(isCurrent == true){
    GMaps.geocode({
          address: des,
          callback: function(results,status){
            if(status == 'OK'){
              var desPos = results[0].geometry.location;
              map.renderRoute({
                origin: curOri,
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
                  travelMode: $("#input_mode").val(),
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