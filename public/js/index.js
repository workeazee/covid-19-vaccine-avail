$(document).ready(function () {
  var responseData;
  var resultContainer = $("#result");

  var notificationsPermissions = false;
  var notificationCount = 0;
  var notificationGiven = false;
  // Otherwise, we need to ask the user for permission
  if ((window.Notification) && (Notification.permission !== 'denied' || Notification.permission === "default")) {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        notificationsPermissions = true;
      }
    });
  }

  callApi();
  window.setInterval(function () {
    callApi();
  }, 4000);

  $("#reset_all").on("click", function (e) {
    $(".filters-list .filter").removeClass("selected");
    populateData(responseData);
  });
  $("#filter_available").on("click", function (e) {
    if ($("#filter_available").hasClass("selected"))
      $("#filter_available").removeClass("selected");
    else $("#filter_available").addClass("selected");
    populateData(responseData);
  });
  $("#filter_covaxin").on("click", function (e) {
    if ($("#filter_covaxin").hasClass("selected"))
      $("#filter_covaxin").removeClass("selected");
    else $("#filter_covaxin").addClass("selected");
    populateData(responseData);
  });
  $("#filter_covishield").on("click", function (e) {
    if ($("#filter_covishield").hasClass("selected"))
      $("#filter_covishield").removeClass("selected");
    else $("#filter_covishield").addClass("selected");
    populateData(responseData);
  });
  $("#filter_free").on("click", function (e) {
    if ($("#filter_free").hasClass("selected"))
      $("#filter_free").removeClass("selected");
    else $("#filter_free").addClass("selected");
    populateData(responseData);
  });
  $("#filter_paid").on("click", function (e) {
    if ($("#filter_paid").hasClass("selected"))
      $("#filter_paid").removeClass("selected");
    else $("#filter_paid").addClass("selected");
    populateData(responseData);
  });
  $("#filter_18plus").on("click", function (e) {
    if ($("#filter_18plus").hasClass("selected"))
      $("#filter_18plus").removeClass("selected");
    else $("#filter_18plus").addClass("selected");
    populateData(responseData);
  });
  $("#filter_45plus").on("click", function (e) {
    if ($("#filter_45plus").hasClass("selected"))
      $("#filter_45plus").removeClass("selected");
    else $("#filter_45plus").addClass("selected");
    populateData(responseData);
  });

  function callApi() {
    var today = new Date();
    var date =
      today.getDate() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getFullYear() +
      "   " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();
    $(".legend-item.date").text("Updated On: " + date);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        $("#error").hide();
        var response = jQuery.parseJSON(this.responseText);
        responseData = response;
        populateData(response);
        return response;
      } else {
        $("#error").show();
      }
    };
    xhttp.open(
      "GET",
      "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=392&date=" +
        date.substring(0, date.indexOf(" ")),
      true
    );
    xhttp.send();
  }

  function populateData(response) {
    let list = [];
    for (let center of response.centers) {
      list.push(center);
    }
    displayInHtml(list);
  }

  function checkForFilters(item) {
    var availabilityFlag = true;
    var vaccineFlag = true;
    var feesFlag = true;
    var ageFlag = true;
    if ($("#filter_available").hasClass("selected")) availabilityFlag = false;
    if (
      $("#filter_covaxin").hasClass("selected") ||
      $("#filter_covishield").hasClass("selected")
    )
      vaccineFlag = false;
    if (
      $("#filter_free").hasClass("selected") ||
      $("#filter_paid").hasClass("selected")
    )
      feesFlag = false;
    if (
      $("#filter_18plus").hasClass("selected") ||
      $("#filter_45plus").hasClass("selected")
    )
      ageFlag = false;

    if (availabilityFlag && vaccineFlag && feesFlag && ageFlag) return true;

    if ($("#filter_available").hasClass("selected")) {
      var availableSession = item.sessions.find(
        (session) => session.available_capacity > 0
      );
      if (availableSession) availabilityFlag = true;
    }

    if ($("#filter_covaxin").hasClass("selected")) {
      var covaxinSession = item.sessions.find(
        (session) => session.vaccine == "COVAXIN"
      );
      if (covaxinSession) vaccineFlag = true;
      else vaccineFlag = false;
    }
    if ($("#filter_covishield").hasClass("selected")) {
      var covishieldSession = item.sessions.find(
        (session) => session.vaccine == "COVISHIELD"
      );
      if (covishieldSession) vaccineFlag = true;
      else vaccineFlag = false;
    }
    if (
      $("#filter_covaxin").hasClass("selected") &&
      $("#filter_covishield").hasClass("selected")
    ) {
      var covaxinSession = item.sessions.find(
        (session) => session.vaccine == "COVAXIN"
      );
      var covishieldSession = item.sessions.find(
        (session) => session.vaccine == "COVISHIELD"
      );
      if (covaxinSession || covishieldSession) vaccineFlag = true;
      else vaccineFlag = false;
    }

    if ($("#filter_free").hasClass("selected")) {
      if (item.fee_type == "Free") feesFlag = true;
      else feesFlag = false;
    }
    if ($("#filter_paid").hasClass("selected")) {
      if (item.fee_type == "Paid") feesFlag = true;
      else feesFlag = false;
    }
    if (
      $("#filter_free").hasClass("selected") &&
      $("#filter_paid").hasClass("selected")
    ) {
      if (item.fee_type == "Free" || item.fee_type == "Paid") feesFlag = true;
      else feesFlag = false;
    }

    if ($("#filter_18plus").hasClass("selected")) {
      var minAge18Session = item.sessions.find(
        (session) => session.min_age_limit == 18
      );
      if (minAge18Session) ageFlag = true;
      else ageFlag = false;
    }
    if ($("#filter_45plus").hasClass("selected")) {
      var minAge45Session = item.sessions.find(
        (session) => session.min_age_limit == 45
      );
      if (minAge45Session) ageFlag = true;
      else ageFlag = false;
    }
    if (
      $("#filter_18plus").hasClass("selected") &&
      $("#filter_45plus").hasClass("selected")
    ) {
      var minAge18Session = item.sessions.find(
        (session) => session.min_age_limit == 18
      );
      var minAge45Session = item.sessions.find(
        (session) => session.min_age_limit == 45
      );
      if (minAge18Session || minAge45Session) ageFlag = true;
      else ageFlag = false;
    }
    return availabilityFlag && vaccineFlag && feesFlag && ageFlag;
  }

  function displayInHtml(list) {
    if (list.length == 0) {
      resultContainer.text("NA");
    } else {
      var counter = 0;
      var html = "";
      if(notificationGiven) {
        notificationCount++;
      }
      for (let item of list) {
        if (checkForFilters(item)) {
          checkForNotification(item);
          counter++;
          var htmlCard = "<div class='card'>";
          htmlCard +=
            "<div class='heading'><div class='name sub-heading'>" +
            item.name +
            "</div>";
          htmlCard +=
            "<div class='sub-heading'><div class='dot'></div></div></div>";
          htmlCard += "<div class='details'>";
          htmlCard += "<div class='fee-type'>Fees: " + item.fee_type + "</div>";
          htmlCard += "<div class='location'>Location:";
          htmlCard += "<div class='address'>" + item.address + "</div>";
          htmlCard += "<div class='block-name'>" + item.block_name + "</div>";
          htmlCard += "<div class='pincode'>" + item.pincode + "</div>";
          htmlCard +=
            "<div class='district-name'>" + item.district_name + "</div>";
          htmlCard += "<div class='state-name'>" + item.state_name + "</div>";
          htmlCard += "</div>";
          htmlCard += "<div class='sessions'>Sessions:";
          var countSession = 0;
          for (let session of item.sessions) {
            countSession++;
            htmlCard += "<div class='session'>Session " + countSession + ":";
            htmlCard += "<div class='date'>Date: " + session.date + "</div>";
            htmlCard +=
              "<div class='vaccine'>Vaccine: " + session.vaccine + "</div>";
            htmlCard +=
              "<div class='min-age-limit'>Minimum Age Limit: " +
              session.min_age_limit +
              "</div>";
            htmlCard +=
              "<div class='available-capacity'>Availability: <span>" +
              session.available_capacity +
              "</span></div>";
            htmlCard += "</div>";
          }
          htmlCard += "</div>";
          htmlCard += "</div>";
          htmlCard += "</div>";
          html = html + htmlCard;
        }
      }
      resultContainer.html(html);
      $("#centers").text(counter + " centers shortlisted");
      $(".card").each(function () {
        var filterIfAnySessionAvailable = $(this)
          .find(".session .available-capacity span")
          .filter(function () {
            return $(this).text() != "0";
          });
        if (filterIfAnySessionAvailable.length == 0)
          $(this).find(".heading .dot").addClass("red");
        else $(this).find(".heading .dot").addClass("green");
      });
    }
  }

  function checkForNotification(item) {
    var availableSession = item.sessions.find(
      (session) => session.available_capacity > 0
    );
    var options = {
      body: "Center: "+item.name+"\n"+item.address+","+item.block_name+","+item.pincode,
      vibrate: [500, 250, 500, 250, 500, 250, 500, 250, 500]
    };
    if (item.fee_type == "Paid" && notificationsPermissions) {
      if(notificationCount < 1) {
        notificationGiven = true;
        new Notification("Vaccine Center Available!", options);
      }
    };
  }
});
