// SCSCSC MAIN.JS 


// Check to see if there's nothing in localStorage, if nothing then ass empty array
var check = localStorage.getItem("cards");
if (!check) {
    localStorage.setItem("cards", JSON.stringify([]));
}

// Random number as key for image 
var key = Math.floor(Math.random() * 10000);

// PWA fundamentals -- Making a service worker..
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/cards/sw.js')
            .then(reg => console.log('Service Worker: Registered'))
            .catch(err => console.log('Service Worker: Error' + err))
    })
}

// Flag to acknowledge file change
var fileChanged = false;

// Angular Dynamic Binding 
var CardsApp = angular.module('CardsApp', []);

// Angular file directive
CardsApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

CardsApp.service('fileUpload', ['$http', function ($http) {

    this.uploadFileToUrl = function (file) {
        var fd = new FormData();
        fd.append('file', file);
        $http.post('/pics/add', fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).then(function mySuccess(response) {
            $http({
                method: "POST",
                url: "/api/class/",
                data: activeGrp
            }).then((result) => {
                // What do i do with the result ?
                console.log("Successfully transacted the message ....");
            }, (result) => {
                alert("Some error geting messages");
            })
        }, function myError(response) {
            console.log(response.data);
        });
    }

}]);

CardsApp.controller('CardsController', ($scope, $interval, $http) => {
    console.log("Controller loaded !");

    // Place for scope experimentation
    $scope.nums = [
        0,
        1,
        2,
        3
    ]

    // Card list
    var cardList = JSON.parse(localStorage.getItem("cards"));

    // Assigning 0 as default for unchecked box
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
        $scope.submit[index] = "Check"
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

    // Declaring a flag to prevent click when already click is acknowledged
    var disableBtn = false;

    // Verifying answers
    $scope.log = function (index) {

        if (!disableBtn) {

            disableBtn = true;
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
                if (tick == 3) {
                    for (let count = 0; count < 4; count++) {
                        $scope.resCol[count] = "";
                        $scope.cards[index].qopts[count] = false;
                        $scope.submit[index] = "Submit";
                        disableBtn = false;
                    }
                } else {
                    $scope.submit[index] = "Resetting in " + (3 - tick);
                    console.log(tick);
                }
            }, 1000, 3);
        }
    }

    // Link to the new card page
    $scope.addcard = function () {
        console.log('Clicked !');
        location.replace('/cards/add_card.html')
    }

    // Navigating to share 
    $scope.nav_share = function (index) {
        localStorage.setItem('share', index);
        location.replace('/cards/share.html');;
    }

    // Try to adjust scope for name of card 
    try {
        $scope.share_head = JSON.parse(localStorage.getItem('cards'))[localStorage.getItem('share')].title
    } catch (err) { }

    // Share

    $scope.share = function () {
        tempCard = JSON.parse(localStorage.getItem('cards'))[localStorage.getItem('share')]
        $http.post('http://192.168.0.109:1000/api/add/priv_cards',
        {
            "title":tempCard.title,
            "pic":"/card",
            "ans":tempCard.ans,
            "crId":"Chin89"
        }
        ).then((res=>{
            console.log(res.data)
        },(res)=>{
            console.log(res.data)

        }))
    }

    // Navigating edit card page, running the script to get the card object
    $scope.nav_edit = function (index) {
        localStorage.setItem('edit', index)
        location.replace('/cards/edit_card.html');
    }

    // Setting edit item
    $scope.edit_card = cardList[localStorage.getItem('edit')]

    // Creating the new card as a json obj, appending to array and replacing that in the localStorage
    // Image processing is frankly a pain...
    // Here's the plan....
    // Get file from input => using tha crazy peice of code i saw.. Store it just like that and see what happens

    $scope.createCard = function () {
        console.log("Creating Card...");
        if (!document.getElementById('files').files[0]) {
            localStorage.setItem(key, "./res/img/plce.jpg");
            console.log("No image uploaded")
        }

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

    // Rerendering the scope to accept an changes
    function rerender() {
        var cardList = JSON.parse(localStorage.getItem("cards"));
        $scope.cards = cardList;
        location.replace('./cards!.html')
    }

    // Creating Color for showing answer correctness
    $scope.resCol = [];

    // Editing card and creating new card
    $scope.editCard = function () {
        var edited = {};
        edited.title = $scope.edit_card.title;
        edited.ans = $scope.edit_card.ans;

        console.log(fileChanged)

        if (fileChanged) {
            console.log('Change acknowledged')
            $scope.edit_card.pic = localStorage.getItem(key);
        }
        edited.pic = $scope.edit_card.pic

        fileChanged = false;
        localStorage.removeItem(key);
        console.log(edited);

        var ind = localStorage.getItem('edit');

        var tempList = JSON.parse(localStorage.getItem('cards'))

        tempList[ind] = edited;

        localStorage.setItem('cards', JSON.stringify(tempList));

        localStorage.removeItem('edit');

        rerender();
    }

    // Delete card functionality

    $scope.deleteCard = function (index) {
        console.log('Initiaiting delete for element ' + index);
        var tempList = []
        tempList = JSON.parse(localStorage.getItem('cards'))
        tempList.splice(index, 1);
        localStorage.setItem('cards', JSON.stringify(tempList));
        rerender();
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

    fileChanged = true;

    console.log('File changed')

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


                    // Chech and use indexeddb
                    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB ||
                    //     window.msIndexedDB;

                    // window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction ||
                    //     window.msIDBTransaction;
                    // window.IDBKeyRange = window.IDBKeyRange ||
                    //     window.webkitIDBKeyRange || window.msIDBKeyRange

                    // if (!window.indexedDB) {
                    //     window.alert("Your browser doesn't support a stable version of IndexedDB.")
                    // }

                    // var db;
                    // var request = window.indexedDB.open('test', 3)

                    // request.onsuccess = (e) => {
                    //     db = request.result;
                    //     var obje = {
                    //         'id':key,
                    //         'pic':e.target.result
                    //     }
                    //     var objectStore = db.createObjectStore("image", { keyPath: "id" });

                    //     objectStore.add(obje);
                    //     console.log('Successfully Setup db ' + JSON.stringify(db));
                    // }

                    // request.onerror = (e) => {
                    //     console.log('Error seting up db ' + e)
                    // }

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
