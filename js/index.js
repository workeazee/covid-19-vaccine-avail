$(document).ready(function () {
  var responseData;
  var resultContainer = $("#result");

  callApi();
  window.setInterval(function () {
    callApi();
  }, 4500);

  $("#reset_available").on("click", function (e) {
    $(".availability-filters .filter").removeClass("selected");
    populateData(responseData);
  });

  $("#filter_available").on("click", function (e) {
    if ($("#filter_available").hasClass("selected"))
      $("#filter_available").removeClass("selected");
    else {
      $(".availability-filters .filter").removeClass("selected");
      $("#filter_available").addClass("selected");
    }
    populateData(responseData);
  });

  $("#filter_not_available").on("click", function (e) {
    if ($("#filter_not_available").hasClass("selected"))
      $("#filter_not_available").removeClass("selected");
    else {
      $(".availability-filters .filter").removeClass("selected");
      $("#filter_not_available").addClass("selected");
    }
    populateData(responseData);
  });

  $("#reset_vaccine").on("click", function (e) {
    $(".vaccine-filters .filter").removeClass("selected");
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

  $("#reset_fees").on("click", function (e) {
    $(".fees-filters .filter").removeClass("selected");
    populateData(responseData);
  });

  $("#filter_free").on("click", function (e) {
    if ($("#filter_free").hasClass("selected"))
      $("#filter_free").removeClass("selected");
    else {
      $(".fees-filters .filter").removeClass("selected");
      $("#filter_free").addClass("selected");
    }
    populateData(responseData);
  });

  $("#filter_paid").on("click", function (e) {
    if ($("#filter_paid").hasClass("selected"))
      $("#filter_paid").removeClass("selected");
    else {
      $(".fees-filters .filter").removeClass("selected");
      $("#filter_paid").addClass("selected");
    }
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
        var response = jQuery.parseJSON(this.responseText);
        responseData = response;
        populateData(response);
        return response;
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
      //var sessions = center.sessions;
      //for (let session of sessions) {
      list.push(center);
      //}
    }
    displayInHtml(list);
  }

  function checkForFilters(item) {
    var flag1 = true;
    var flag2 = true;
    var flag3 = true;
    if ($(".availability-filters .filter").hasClass("selected")) {
      flag1 = false;
    }
    if ($(".vaccine-filters .filter").hasClass("selected")) {
      flag2 = false;
    }
    if ($(".fees-filters .filter").hasClass("selected")) {
      flag3 = false;
    }
    if (flag1 && flag2 && flag3) return flag1 && flag2 && flag3;
    if ($("#filter_available").hasClass("selected")) {
      var availableSession = item.sessions.find(
        (session) => session.available_capacity > 0
      );
      if (availableSession) flag1 = true;
    } else if ($("#filter_not_available").hasClass("selected")) {
      var notAvailableSession = item.sessions.filter(
        (session) => session.available_capacity == 0
      );
      if (notAvailableSession.length > 0) flag1 = true;
    }
    if ($("#filter_covaxin").hasClass("selected")) {
      var covaxinSession = item.sessions.find(
        (session) => session.vaccine == "COVAXIN"
      );
      if (covaxinSession) flag2 = true;
      else flag2 = false;
    }
    if ($("#filter_covishield").hasClass("selected")) {
      var covishieldSession = item.sessions.find(
        (session) => session.vaccine == "COVISHIELD"
      );
      if (covishieldSession) flag2 = true;
      else flag2 = false;
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
      if (covaxinSession || covishieldSession) flag2 = true;
      else flag2 = false;
    }
    if ($("#filter_free").hasClass("selected")) {
      if (item.fee_type == "Free") flag3 = true;
      else flag3 = false;
    } else if ($("#filter_paid").hasClass("selected")) {
      if (item.fee_type == "Paid") flag3 = true;
      else flag3 = false;
    }
    return flag1 && flag2 && flag3;
  }

  function displayInHtml(list) {
    if (list.length == 0) {
      resultContainer.text("NA");
    } else {
      var counter = 0;
      var html = "";
      for (let item of list) {
        if (checkForFilters(item)) {
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
});
