  var base_url = 'http://' + window.location.hostname + '/clearance/api/';
  $('.purokTable').dataTable();
    
  function viewLocation(latlong)
  {

      var gm = google.maps;
      var map = new gm.Map(document.getElementById('map'), {
        mapTypeId: 'satellite',
        center: new gm.LatLng(latlong), 
        zoom: 25,  // whatevs: fitBounds will override
        scrollwheel: false
      });
      var iw = new gm.InfoWindow();
      var oms = new OverlappingMarkerSpiderfier(map,
        {markersWontMove: true, markersWontHide: true});


      var shadow = new gm.MarkerImage(
        'https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
        new gm.Size(37, 34),  // size   - for sprite clipping
        new gm.Point(0, 0),   // origin - ditto
        new gm.Point(10, 34)  // anchor - where to meet map location
      );

        var iconBase = 'http://localhost/clearance/resources/assets/img/';

      
      oms.addListener('click', function(marker) {
        iw.setContent(marker.desc);
        iw.open(map, marker);
      });
      oms.addListener('spiderfy', function(markers) {
        for(var i = 0; i < markers.length; i ++) {
          markers[i].setIcon(iconBase + 'marker.png');
          markers[i].setShadow(null);
        } 
        iw.close();
      });
      oms.addListener('unspiderfy', function(markers) {
        for(var i = 0; i < markers.length; i ++) {
          markers[i].setIcon(iconBase + 'marker.png');
          markers[i].setShadow(shadow);
        }
      });

      
      var bounds = new gm.LatLngBounds();

      function runOnComplete(){
        for (var i = 0; i < global_arr.length; i ++) {
            var datum = global_arr[i];
            var loc = new gm.LatLng(datum.lat, datum.lon);
            bounds.extend(loc);
            var marker = new gm.Marker({
              position: loc,
              title: '',
              map: map,
              icon: iconBase + 'marker.png',
              shadow: shadow
            });
            marker.desc = '<center><a href="http://localhost/clearance/storage/app/'+datum.profile_picture+'"><img src="http://localhost/clearance/storage/app/'+datum.profile_picture+'" style="width:150px;height:150px;"></a></center>';
            oms.addMarker(marker);
          }

          // Uncomment This if you want to  load map on fit bound
          //map.fitBounds(bounds);

          // for debugging/exploratory use in console
          window.map = map;
          window.oms = oms;
      }
      
      var global_arr = [];

      $.getJSON("http://localhost/clearance/api/admin/users", function(restdata) {
        console.log(restdata);
           $.each(restdata, function(key, value) {
            global_arr.push({id: value.id,
                             profile_picture : value.profilepic,
                             lat: value.latitude,
                             lon: value.longitude});
           });
          runOnComplete();
      });
  }

  function editPurokleader(id)
  {
    $('#editPurokLeaderModal').modal('toggle');
  }

  function deletPurokLeader(id)
  {
         var r = confirm("Are you sure you want to delete this!");
        if (r == true) {
              $.ajax({
              url: base_url+"admin/purokleader/delete/"+id,
             }).done(function(data) {
                if (data == 1) {
                  $.toaster('purok leader delete success!','Success', 'success');

                  viewNoticeBlotter(id);
                }else{
                    $.toaster('Something went wrong please try again','Error :', 'danger');
                }
            });
        }  
  }

  function addNewPurokLeader()
  {
     $('#addPurokLeaderModal').modal('toggle');
     
        $('#addPurokleader').submit(function(e){
            $.ajax({
                     type: "POST",
                     url: base_url+'admin/purokleader/save',
                     data: $("#addPurokleader").serialize(), // serializes the form's elements.
                     success: function(data)
                     {
                          $.toaster({ settings :{'timeout' : 9500}});

                          if(data == 1)
                          {
                              // Success
                              $.toaster('Purok leader saved success!','Success', 'success');
                          }
                          else if(data == 0)
                          {
                              // Error
                              $.toaster('Something went wrong please try again','Error :', 'danger');
                          }

                          else
                          {
                              // Error
                              $.toaster(data,'Error', 'warning');
                          }
                     }
               });
              e.preventDefault();
       }) 

  }
  