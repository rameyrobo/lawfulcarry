/*
    bootstrap_calendar by bic.cat (http://bic.cat) & xero (http://xero.nu)
    https://github.com/xero/bootstrap_calendar
    released open source under the Apache License
*/
$.fn.mcalendar = function(options) {

    var args = $.extend({}, $.fn.mcalendar.defaults, options);

    this.each(function(){

        var calendar;
        var lblDaysMonth;
        var lblTextMonth = $('<div class="visualmonthyear"></div>');

        var calendar_id = "cal_" + Math.floor(Math.random()*99999).toString(36);

        var busyclass ;
        if(typeof args.busyclass != "undefined") {
            busyclass = args.busyclass ;
        } else {
            busyclass = "label-warning";
        }

        var freedays;
        if(typeof args.freedays != "undefined")  {
            freedays = args.freedays
        } else {
            freedays = false;
        }

        var months;
        if ( typeof args.months != "undefined" )
            months = args.months;
        else
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var tooltip_options;
        if ( typeof args.tooltip_options != "undefined" )
            tooltip_options = args.tooltip_options;
        else
            tooltip_options = {placement: 'top', container: 'body'};


        var data ;
        if (typeof args.data != "undefined")
            data  = args.data ;
        else
            data = [];

        var elem = $(this);
        showCalendar();

        /*** functions ***/

        //display
        function showCalendar(){
            //days of month label
            lblDaysMonth = $('<table class="daysmonth table table">');


            //date calculation object
            var dateObj = new Date();
            //check for date input
            var dateText = elem.val();
            if (dateText!= ""){
                if (validateDate(dateText)){
                    var dateTextArray = dateText.split("/");
                    //two digit years
                    if(dateTextArray[2].length == 2){
                        if (dateTextArray[2].charAt(0)=="0"){
                            dateTextArray[2] = dateTextArray[2].substring(1);
                        }
                        dateTextArray[2] = parseInt(dateTextArray[2]);
                        if (dateTextArray[2] < 50)
                            dateTextArray[2] += 2000;
                    }
                    dateObj = new Date(dateTextArray[2], dateTextArray[1]-1, dateTextArray[0])
                }
            }

            //current month & year
            var month = dateObj.getMonth();
            var year = dateObj.getFullYear();
            showDaysOfMonth(month, year);

            showData(month, year);


            //next/previous month controls
            var btnNextMonth = $('<td><i class="icon-arrow-right"></i></td>');
            btnNextMonth.click(function(e){
                e.stopPropagation();
                e.preventDefault();
                month = (month + 1) % 12;
                if (month==0)
                    year++;
                change_month(month, year);
            });
            var btnPrevMonth = $('<td><i class="icon-arrow-left"></i></td>');
            btnPrevMonth.click(function(e){
                e.stopPropagation();
                e.preventDefault();
                month = (month - 1);
                if (month==-1){
                    year--;
                    month = 11;
                }
                change_month(month, year);
            });
            $('.icon-arrow-left').css('cursor', 'pointer');
            $('.icon-arrow-right').css('cursor', 'pointer');

            //current year & month label
            var lblDate = $('<table class="table header"><tr></tr></table>');
            var lblDateControl = $('<td colspan=5 class="year span6"></td>');
            lblDate.append(btnPrevMonth);
            lblDate.append(lblDateControl);
            lblDate.append(btnNextMonth);
            lblDateControl.append(lblTextMonth);

            calendar = $('<div class="calendar" id="' +calendar_id +'" ></div>');
            calendar.prepend(lblDate);
            //calendar.append(lblWeek);
            //lblDaysMonth.prepend(lblWeek);
            calendar.append(lblDaysMonth);

            //render calendar
            elem.append(calendar);
            $('#' + calendar_id + ' ' + 'td.event_tooltip').tooltip(tooltip_options);
        }

        function change_month(month, year){
            lblDaysMonth.empty();
            showDaysOfMonth(month, year);
            showData(month, year);
            $('#' + calendar_id + ' ' + 'td.event_tooltip').tooltip(tooltip_options);
        }

        // Compute easter monday
        // Code from http://coderzone.org/library/Get-Easter-Date-for-any-year-in-Javascript_1059.htm
        function Easter(Y) {
            var C = Math.floor(Y/100);
            var N = Y - 19*Math.floor(Y/19);
            var K = Math.floor((C - 17)/25);
            var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
            I = I - 30*Math.floor((I/30));
            I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
            var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
            J = J - 7*Math.floor(J/7);
            var L = I - J;
            var M = 3 + Math.floor((L + 40)/44);
            var D = L + 28 - 31*Math.floor(M/4);
            M -= 1; // Set values 0-11
            if((M == 2) && (D == 31)) {
                M += 1;
                D = 1;
            } else {
                D += 1;
            }

            return {"month":M, "day":D};
        }

        // Return true of the day is free
        // Only consider free days in France
        // Can be updated for other countries
        function is_free_fr(day, month, year) {
            fixed_days = [{"month":0, "day":1}, // 1er Jan
                       {"month":4, "day":1}, //1er Mai
                       {"month":4, "day":8}, // 8 Mai
                       {"month":6, "day":14}, // 14 Juillet
                       {"month":7, "day":15}, //15 Aout
                       {"month":10, "day":1}, // Toussaint 1er Nov
                       {"month":10, "day":11}, // Armistice
                       {"month":11, "day":25}, // Noel
                       ];
            for(var fd in fixed_days) {
                if((day == fixed_days[fd]["day"]) && (month == fixed_days[fd]["month"])) {
                    return true;
                }
            };
            easter = Easter(year);
            if((easter.month == month) && (easter.day == day)) {
                return true;
            };
            ascension = new Date(year, easter.month, easter.day + 38);
            if((ascension.getDate() == day) && (ascension.getMonth() == month)) {
                return true;
            }
            pentecote = new Date(year, easter.month, easter.day + 49);
            if((pentecote.getDate() == day) && (pentecote.getMonth() == month)) {
                return true;
            };
            return false;
        };

        function showDaysOfMonth(month, year){
            lblTextMonth.text(months[month] + " " + year);

            var firstDay = calculateWeekday(1, month, year);
            var lastDaymonth = lastDay(month,year);
            var today = new Date();
            var next_month = month + 1;

            var lblDaysMonth_string = "<tr class='week_days'><td class='first'></td>";
            for(var i=1;i< lastDaymonth;i++) {
                if((today.getDate() == i) && (today.getMonth() == month) && (today.getFullYear() == year)) {
                    lblDaysMonth_string += "<td class='today'>";
                } else {
                    lblDaysMonth_string += "<td>";
                }
                if(i < 10) {
                    lblDaysMonth_string += "0" + i +"</td>";
                } else {
                    lblDaysMonth_string += "" + i +"</td>";
                }
            };
            lblDaysMonth_string += "<td class='last'>" + lastDaymonth + "</td></tr>";

            lblDaysMonth.append( lblDaysMonth_string );
        }

        function showData(month, year) {
            var firstDay = calculateWeekday(1, month, year);
            var lastDaymonth = lastDay(month,year);
            var lblDaysMonth_string = "";
            for(var row in data) {
                if(typeof data[row].style != "undefined") {
                    lblDaysMonth_string += "<tr class='datarow'><td style='" + data[row].style + "' class='first'>" + data[row].name + "</td>";
                } else {
                    lblDaysMonth_string += "<tr class='datarow'><td class='first'>" + data[row].name + "</td>";
                }
                theDates = [];
                for(var d in data[row].dates) {
                    var a = {"start":new Date(data[row].dates[d].start), "end":new Date(data[row].dates[d].end)};
                    if(typeof data[row].dates[d].tooltip != "undefined") {
                        a["tooltip"] = data[row].dates[d].tooltip;
                    }
                    if(typeof data[row].dates[d].class != "undefined") {
                        a["class"] = data[row].dates[d].class;
                    }
                    if(typeof data[row].dates[d].start_half != "undefined") {
                        a["start_half"] = data[row].dates[d].start_half;
                    } else {
                        a["start_half"] = false;
                    }
                    if(typeof data[row].dates[d].end_half != "undefined") {
                        a["end_half"] = data[row].dates[d].end_half;
                    } else {
                        a["end_half"] = false;
                    }
                    theDates.push(a);
                };
                for(var day=1;day<=lastDaymonth;day++) {
                    busytext = "";
                    busy = false;
                    bc = busyclass ;
                    weekend = false ;
                    delete busytooltip ;
                    today = new Date(year, month, day);
                    if((today.getDay() == 0) || (today.getDay() == 6)) {
                        weekend = true;
                    }
                    if(freedays) {
                        if(is_free_fr(day, month, year))  {
                            weekend = true;
                        }
                    };
                    if(weekend == false) {
                        for(var date in theDates) {
                            if((today >= theDates[date].start) && (today < theDates[date].end)) {
                                busy = true;
                                if(typeof theDates[date].tooltip != "undefined") {
                                    busytooltip = theDates[date].tooltip ;
                                }
                                if(typeof theDates[date].class != "undefined") {
                                    bc = theDates[date].class ;
                                }
                                if(typeof theDates[date].start_half != "undefined") {
                                    if((today.toDateString() == theDates[date].start.toDateString()) && (theDates[date].start_half)) {
                                        busytext = "&#189;";
                                    }
                                }
                            }else if ((today.toDateString() == theDates[date].end.toDateString()) && (theDates[date].end_half == true)) {
                                busy = true;
                                busytext = "&#189;";
                                if(typeof theDates[date].tooltip != "undefined") {
                                    busytooltip = theDates[date].tooltip ;
                                }
                                if(typeof theDates[date].class != "undefined") {
                                    bc = theDates[date].class ;
                                }
                            };
                        };
                    };
                    lblDaysMonth_string += "<td class='";
                    if(weekend) {
                        lblDaysMonth_string += "weekend ";
                    } else {
                        if(busy) {
                            lblDaysMonth_string += bc +" ";
                        };
                    }
                    if(day == lastDaymonth) {
                        lblDaysMonth_string += "last ";
                    }
                    if(typeof busytooltip != "undefined") {
                        lblDaysMonth_string += "event_tooltip";
                    }
                    lblDaysMonth_string += "'";
                    if((typeof busytooltip != "undefined") && (weekend == false)) {
                        lblDaysMonth_string += "title='" + busytooltip + "'";
                    }
                    lblDaysMonth_string += ">" + busytext + "</td>";
                };
                lblDaysMonth_string += "</tr>";
            };
            lblDaysMonth.append(lblDaysMonth_string);
        };

        //calcuation number of days in week
        function calculateWeekday(day,month,year){
            var dateObj = new Date(year, month, day);
            var numDay = dateObj.getDay();
            return numDay;
        }

        //date validation
        function checkdate (m, d, y) {
            // function by http://kevin.vanzonneveld.net
            // extracted from the manual phpjs.org libraries at http://www.desarrolloweb.com/manuales/manual-librerias-phpjs.html
            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
        }

        //calculate last day of month for a given year
        function lastDay(month,year){
            var last_day=28;
            while (checkdate(month+1,last_day + 1,year)){
                last_day++;
            }
            return last_day;
        }

        function validateDate(date){
            var dateArray = date.split("/");
            if (dateArray.length!=3)
                return false;
            return checkdate(dateArray[1], dateArray[0], dateArray[2]);
        }

    /*** --functions-- ***/

    });
    return this;
};
