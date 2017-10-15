angular.module('ionic-timepicker.provider', [])

    .provider('ionicTimePicker', function () {

        // TODO: Improve min and max hours : parse string (HH:MM AM|PM)
        var config = {
            setLabel: 'Set',
            closeLabel: 'Close',
            inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
            format: 12,
            step: 5,
            minHours: 0,
            maxHours: 0,
            closedRange: []
        };

        this.configTimePicker = function (inputObj) {
            angular.extend(config, inputObj);
        };

        this.$get = ['$rootScope', '$ionicPopup', function ($rootScope, $ionicPopup) {

            var provider = {};
            var $scope = $rootScope.$new();
            $scope.today = resetHMSM(new Date()).getTime();
            $scope.time = {};

            //Reset the hours, minutes, seconds and milli seconds
            function resetHMSM(currentDate) {
                currentDate.setHours(0);
                currentDate.setMinutes(0);
                currentDate.setSeconds(0);
                currentDate.setMilliseconds(0);
                return currentDate;
            }


            //Increasing the hours
            $scope.increaseHours = function () {
                $scope.time.hours = Number($scope.time.hours);
                // TODO: improve to add max hour in 12 hours mode
                if ($scope.mainObj.format == 12) {
                    if ($scope.time.hours != 12) {
                        $scope.time.hours += 1;
                    } else {
                        $scope.time.hours = 1;
                    }
                }
                if ($scope.mainObj.format == 24) {
                    var nextHour = ($scope.time.hours + 1) % 24;
                    if ($scope.mainObj.maxHours !== 0) {
                        if (nextHour < $scope.mainObj.maxHours) {
                            $scope.time.hours = nextHour;
                        }
                    } else {
                        $scope.time.hours = nextHour;
                    }
                }
                $scope.time.hours = ('0' + $scope.time.hours).slice(-2);
            };

            //Decreasing the hours
            $scope.decreaseHours = function () {
                $scope.time.hours = Number($scope.time.hours);
                // TODO: improve to add min hour in 12 hours mode
                if ($scope.mainObj.format == 12) {
                    if ($scope.time.hours > 1) {
                        $scope.time.hours -= 1;
                    } else {
                        $scope.time.hours = 12;
                    }
                }
                if ($scope.mainObj.format == 24) {
                    var prevHours = ($scope.time.hours + 23) % 24;

                    if ($scope.mainObj.minHours !== 0) {
                        if (prevHours >= $scope.mainObj.minHours) {
                            $scope.time.hours = prevHours;
                        }
                    } else {
                        $scope.time.hours = prevHours;
                    }
                }
                $scope.time.hours = ('0' + $scope.time.hours).slice(-2);
            };

            //Increasing the minutes
            $scope.increaseMinutes = function () {
                $scope.time.minutes = Number($scope.time.minutes);
                var nextMinutes = ($scope.time.minutes + $scope.mainObj.step) % 60;

                if ($scope.mainObj.closedRange.length == 2) {
                    var beginRange = $scope.mainObj.closedRange[0];
                    var endRange = $scope.mainObj.closedRange[1];

                    if (nextMinutes > beginRange) {
                        nextMinutes = endRange;
                        if (endRange < beginRange) {
                            $scope.increaseHours();
                        }
                    }
                }

                $scope.time.minutes = nextMinutes;

                if (!nextMinutes) {
                    $scope.increaseHours();
                }

                $scope.time.minutes = ('0' + $scope.time.minutes).slice(-2);
            };

            //Decreasing the minutes
            $scope.decreaseMinutes = function () {
                $scope.time.minutes = Number($scope.time.minutes);
                var prevMinutes = ($scope.time.minutes + (60 - $scope.mainObj.step)) % 60;

                if ($scope.mainObj.closedRange.length == 2) {
                    var beginRange = $scope.mainObj.closedRange[0];
                    var endRange = $scope.mainObj.closedRange[1];

                    if (prevMinutes < endRange) {
                        prevMinutes = beginRange;
                        if (endRange < beginRange) {
                            $scope.decreaseHours();
                        }
                    }
                }

                $scope.time.minutes = prevMinutes;
                if (!prevMinutes) {
                    $scope.decreaseHours();
                }

                $scope.time.minutes = ('0' + $scope.time.minutes).slice(-2);
            };

            //Changing the meridian
            $scope.changeMeridian = function () {
                $scope.time.meridian = ($scope.time.meridian === "AM") ? "PM" : "AM";
            };

            function setMinSecs(ipTime, format) {
                $scope.time.hours = Math.floor(ipTime / (60 * 60));

                var rem = ipTime % (60 * 60);
                if (format == 12) {
                    if ($scope.time.hours >= 12) {
                        $scope.time.meridian = 'PM';

                        if ($scope.time.hours > 12) {
                            $scope.time.hours -= 12;
                        }
                    }
                    else {
                        $scope.time.meridian = 'AM';
                    }
                }

                if ($scope.time.hours === 0) {
                    $scope.time.hours = 12;
                }

                $scope.time.minutes = rem / 60;

                $scope.time.hours = Math.floor($scope.time.hours);
                $scope.time.minutes = Math.floor($scope.time.minutes);

                if ($scope.time.hours.toString().length == 1) {
                    $scope.time.hours = '0' + $scope.time.hours;
                }
                if ($scope.time.minutes.toString().length == 1) {
                    $scope.time.minutes = '0' + $scope.time.minutes;
                }
                $scope.time.format = $scope.mainObj.format;
            }

            provider.openTimePicker = function (ipObj) {
                var buttons = [];
                $scope.mainObj = angular.extend({}, config, ipObj);
                setMinSecs($scope.mainObj.inputTime, $scope.mainObj.format);

                buttons.push({
                    text: $scope.mainObj.setLabel,
                    type: 'button_set',
                    onTap: function (e) {
                        var totalSec = 0;

                        if ($scope.time.format == 12) {
                            $scope.time.hours = Number($scope.time.hours);
                            if ($scope.time.meridian == 'PM' && $scope.time.hours != 12) {
                                $scope.time.hours += 12;
                            } else if ($scope.time.meridian == 'AM' && $scope.time.hours == 12) {
                                $scope.time.hours -= 12;
                            }
                            totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                        } else {
                            totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                        }
                        $scope.mainObj.callback(totalSec);
                    }
                });

                buttons.push({
                    text: $scope.mainObj.closeLabel,
                    type: 'button_close'
                });

                $scope.popup = $ionicPopup.show({
                    templateUrl: 'ionic-timepicker.html',
                    scope: $scope,
                    cssClass: 'ionic_timepicker_popup',
                    buttons: buttons
                });

            };

            return provider;

        }];

    });
