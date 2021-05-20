$(document).ready(function () {
  var responseData;
  var resultContainer = $("#result");

  var notificationsPermissions = false;
  var notificationCount = 0;
  var notificationGivenInOneCall = false;
  // Otherwise, we need to ask the user for permission
  if (
    window.Notification &&
    (Notification.permission !== "denied" ||
      Notification.permission === "default")
  ) {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        notificationsPermissions = true;
        $("#notification_enable_disable").addClass("selected");
        $("#notification_enable_disable").text("Disable notifications");
      } else {
        $("#notification_enable_disable").removeClass("selected");
        $("#notification_enable_disable").text("Enable notifications");
      }
    });
  }

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) $("#notification_enable_disable").remove();

  callApi();
  window.setInterval(function () {
    callApi();
  }, 4000);
  window.setInterval(function () {
    notificationCount = 0;
    notificationGivenInOneCall = false;
  }, 60000);

  $("#notification_enable_disable").on("click", function (e) {
    if ($("#notification_enable_disable").hasClass("selected")) {
      notificationsPermissions = false;
      $("#notification_enable_disable").removeClass("selected");
      $("#notification_enable_disable").text("Enable notifications");
    } else {
      if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            notificationsPermissions = true;
            $("#notification_enable_disable").addClass("selected");
            $("#notification_enable_disable").text("Disable notifications");
          } else {
            $("#notification_enable_disable").removeClass("selected");
            $("#notification_enable_disable").text("Enable notifications");
          }
        });
      } else if (window.Notification && Notification.permission === "granted")
        notificationsPermissions = true;
      $("#notification_enable_disable").addClass("selected");
      $("#notification_enable_disable").text("Disable notifications");
    }
  });

  $("#reset_all").on("click", function (e) {
    $(".filters-list .filter").removeClass("selected");
    populateData(responseData);
  });
  $("#filter_dose1_availability").on("click", function (e) {
    if ($("#filter_dose1_availability").hasClass("selected"))
      $("#filter_dose1_availability").removeClass("selected");
    else $("#filter_dose1_availability").addClass("selected");
    populateData(responseData);
  });
  $("#filter_dose2_availability").on("click", function (e) {
    if ($("#filter_dose2_availability").hasClass("selected"))
      $("#filter_dose2_availability").removeClass("selected");
    else $("#filter_dose2_availability").addClass("selected");
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
    $(".legend-item#date").text("Updated On: " + date);
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
    var doseNumAvailabilityFlag = true;
    var vaccineFlag = true;
    var feesFlag = true;
    var ageFlag = true;

    if (
      $("#filter_dose1_availability").hasClass("selected") ||
      $("#filter_dose2_availability").hasClass("selected")
    )
      doseNumAvailabilityFlag = false;
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

    if (doseNumAvailabilityFlag && vaccineFlag && feesFlag && ageFlag) return true;

    if ($("#filter_dose1_availability").hasClass("selected")) {
      var dose1Session = item.sessions.find(
        (session) => session.available_capacity_dose1 > 0
      );
      if (dose1Session) doseNumAvailabilityFlag = true;
      else doseNumAvailabilityFlag = false;
    }
    if ($("#filter_dose2_availability").hasClass("selected")) {
      var dose2Session = item.sessions.find(
        (session) => session.available_capacity_dose2 > 0
      );
      if (dose2Session) doseNumAvailabilityFlag = true;
      else doseNumAvailabilityFlag = false;
    }
    if (
      $("#filter_dose1_availability").hasClass("selected") &&
      $("#filter_dose2_availability").hasClass("selected")
    ) {
      var dose1Session = item.sessions.find(
        (session) => session.available_capacity_dose1
      );
      var dose2Session = item.sessions.find(
        (session) => session.available_capacity_dose2
      );
      if (dose1Session || dose2Session) doseNumAvailabilityFlag = true;
      else doseNumAvailabilityFlag = false;
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

    return doseNumAvailabilityFlag && vaccineFlag && feesFlag && ageFlag;
  }

  function displayInHtml(list) {
    if (list.length == 0) {
      resultContainer.text("NA");
    } else {
      var counter = 0;
      var html = "";
      if (notificationGivenInOneCall) {
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
            htmlCard +=
              "<div class='available-capacity-dose1'>Dose 1 Availability: <span>" +
              session.available_capacity_dose1 +
              "</span></div>";
            htmlCard +=
              "<div class='available-capacity-dose1'>Dose 2 Availability: <span>" +
              session.available_capacity_dose2 +
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
      body:
        "Center: " +
        item.name +
        "\n" +
        item.address +
        "," +
        item.block_name +
        "," +
        item.pincode,
      vibrate: [500, 250, 500, 250, 500, 250, 500, 250, 500],
    };
    if (availableSession && notificationsPermissions) {
      if (notificationCount < 1) {
        notificationGivenInOneCall = true;
        var notification = new Notification(
          "Vaccine Center Available!",
          options
        );
        notification.onclick = function (event) {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(
            "https://covid-19-vaccine-availability.web.app/",
            "_blank"
          );
        };
      }
    }
  }
});
