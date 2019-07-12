document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    var options = {
      edge: 'left'
    }
    var instances = M.Sidenav.init(elems, options);

    var elem = document.querySelectorAll('.modal');
    var instance = M.Modal.init(elem, {});
  });
