// SCSCSC MAIN.JS 


// Check to see if there's nothing in localStorage, if nothing then ass empty array
var check = localStorage.getItem("cards");
if (!check) {
    localStorage.setItem("cards", JSON.stringify([]));
}

// Chech and use indexeddb
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 
window.msIndexedDB;
 
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || 
window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || 
window.webkitIDBKeyRange || window.msIDBKeyRange
 
if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
} 

const testData = "SCSCSCSCSCSCs";
var db;
var request = window.indexedDB.open('test',1)

request.onsuccess = (e)=>{
    db = request.result;
    console.log('Successfully Setup db ' + JSON.stringify(db));
}

request.onerror = (e) =>{
    console.log('Error seting up db '+e)
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

// PWA Prompting user to install app
// It's done !!

var fileChanged = false;



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
        $scope.submit[index] = "Check Answers"
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
        location.replace('/cards/new_card.html')
    }

    // Navigating edit card page, running the script to get the card object

    $scope.nav_edit = function (index) {
        localStorage.setItem('edit', index)
        location.replace('/edit_card.html');
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
        location.replace('/cards/cards!.html')
    }

    // Creating Color for showing answer correctness
    $scope.resCol = [];

    // Editing card and creating new card
    $scope.editCard = function () {
        var edited = {};
        edited.title = $scope.edit_card.title;
        edited.ans = $scope.edit_card.ans;
        
        console.log(fileChanged)

        if(fileChanged){
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

        localStorage.setItem('cards',JSON.stringify(tempList));

        localStorage.removeItem('edit');
    }

    // Delete card functionality

    $scope.deleteCard = function (index) {
        console.log('Initiaiting delete for element ' +index );
        var tempList = []
        tempList  = JSON.parse(localStorage.getItem('cards'))
        tempList.splice(index,1);
        localStorage.setItem('cards', JSON.stringify(tempList));
        rerender();
    }

    // Reboot


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