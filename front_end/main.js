// SCSCSC MAIN.JS 


// Check to see if there's nothing in localStorage, if nothing then ass empty array
var check = localStorage.getItem("cards");
if (!check) {
    localStorage.setItem("cards", JSON.stringify([]));
}

// Random number as key for image 
var key = Math.floor(Math.random() * 10000);

// PWA fundamentals -- Making a service worker..

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker
//             .register('./sw.js')
//             .then(reg => console.log('Service Worker: Registered'))
//             .catch(err => console.log('Service Worker: Error' + err))
//     })
// }


// Angular Dynamic Binding 

var CardsApp = angular.module('CardsApp', []);

CardsApp.controller('CardsController', ($scope, $interval) => {
    console.log("Controller loaded !");



    // Place for scope experimentation

    $scope.nums = [
        0,
        1,
        2,
        3
    ]





    // Card list t
    var cardList = JSON.parse(localStorage.getItem("cards"));

    for (let index = 0; index < cardList.length; index++) {
        cardList[index].qopts =
            [
                false,
                false,
                false,
                false
            ];
    }

    // Assigning to scope
    $scope.cards = cardList;

    // Initializing responses
    $scope.qopts = [];

    // Initializing submit button
    $scope.submit = [];

    // Assigning values for the responses as default false
    for (let index = 0; index < cardList.length; index++) {
        $scope.qopts[index] = [
            false,
            false,
            false,
            false
        ]
        $scope.submit[index] = "Submit"
    }


    // Assigning values for new card responses as default false
    $scope.opts = [
        {
            "val": "",
            "bool": false
        },
        {
            "val": "",
            "bool": false
        }, {
            "val": "",
            "bool": false
        }, {
            "val": "",
            "bool": false
        }
    ]

    // Link to the new card page
    $scope.addcard = function () {
        console.log('Clicked !');
        location.replace('/new_card.html')
    }

    // Creating the new card as a json obj, appending to array and replacing that in the localStorage
    // Image processing is frankly a pain...
    // Here's the plan....
    // Get file from input => using tha crazy peice of code i saw.. Store it just like that and see what happens

    $scope.createCard = function () {
        console.log("Creating Card...");
        if (!document.getElementById('files').files[0]) {
            localStorage.setItem(key, "./front_end/res/img/plce.jpg");
            console.log("No image uploaded")
        }

        // Check for indexeddb support 
        'use strict';

        // New card object 


        new_card = {
            "title": $scope.head,
            "pic": localStorage.getItem(key),
            "ans": $scope.opts
        }

        // Appending to the cardList array 
        cardList.push(new_card);

        // Delete temporary image Data
        localStorage.removeItem(key)

        // Updating the localStorage 
        localStorage.setItem("cards", JSON.stringify(cardList));

        // Logging error
        console.log("Card added to list");

        // Refresh the previous array 
        rerender();
    }

    function rerender() {
        var cardList = JSON.parse(localStorage.getItem("cards"));
        $scope.cards = cardList;
        location.replace('/cards!.html')
    }


    $scope.resCol = [];
    // Submitting responses 

    $scope.log = function (index) {
        console.log('Index is ' + index);
        console.log($scope.cards);
        console.log($scope.cards[index].ans)
        console.log($scope.cards[index].qopts)

        for (let ind = 0; ind < 4; ind++) {
            if ($scope.cards[index].ans[ind].bool && $scope.cards[index].qopts[ind]) {
                $scope.resCol[ind] = "green";
            } else if ((!$scope.cards[index].ans[ind].bool && $scope.cards[index].qopts[ind]) || ($scope.cards[index].ans[ind].bool && !$scope.cards[index].qopts[ind])) {
                $scope.resCol[ind] = "red";
            }
        }
        var tick = 0;
        $interval(function resetCol() {
            tick = tick + 1;
            if (tick == 5) {
                for (let count = 0; count < 4; count++) {
                    $scope.resCol[count] = "";
                    $scope.cards[index].qopts[count] = false;
                    $scope.submit[index] = "Submit";
                }
            } else {
                $scope.submit[index] = "Resetting in " + (5 - tick);
                console.log(tick);
            }
        }
            , 1000, 5);


    }


    // This is the end !!
});

try {
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
} catch (error) {
    console.log("Not in add card page.. ")
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.

                var e;
            try {
                localStorage.setItem(key, e.target.result)      
            } catch (error) {
                alert("Picture size exceeds storage space available... upload with lower resolution");
            }
             


            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}



// Notification

// if ("Notification" in window) {
//   let ask = Notification.requestPermission();
//   ask.then(permisision => {
//       if (permisision === "granted") {
//           let msg = new Notification("SCSCSC",
//               {
//                   body: "HI there",
//                   icon: "./res/img/pic.jpg"
//               }
//           );
//           msg.addEventListener("click", e => {
//               console.log('Click recieved from SC')
//           });
//       }
//   });
// }
