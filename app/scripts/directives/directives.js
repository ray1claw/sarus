(function() {
    /* Directives */
    'use strict';
    angular.module('sarusApp.directives', [])
        .directive('repeatDone', repeatDone)
        .directive('myiscroll', myiscroll)
        .directive('disqusDir', disqusDir);

    function disqusDir() {
        return {
            scope: {
                hit: "&"
            }, // {} = isolate, true = child, false/undefined = no change
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            link: function($scope, iElm) {
                iElm.bind('click', function() {
                    var x = document.getElementById('remove_disqus');
                    if (x) {
                        x.parentElement.innerHTML = '<disqus-dir hit="vm.load_disqus(post.index,post.title,url)">   <div class="share_icon"><a>Comment</a></div></disqus-dir>';
                    }
                    this.innerHTML = "<div id='remove_disqus' ><div id='disqus_thread' > </div> </div>";
                    $scope.$eval($scope.hit);
                });
            }
        };
    }

    function repeatDone() {
        return function(scope, element, attrs) {
            if (scope.$last) {
                // all are rendered
                scope.$eval(attrs.repeatDone);
            }
        };
    }
    myiscroll.inject = ['$timeout'];

    function myiscroll($timeout) {
        return {
            scope: {
                onEnd: "&"
            },
            restrict: 'A',
            link: function($scope, iElm) {
                var raw = iElm[0];
                $timeout(function() {
                    var myscroll = new IScroll(raw, {
                        scrollX: true,
                        mouseWheel: true,
                        scrollbars: true,
                        click: true
                    });
                    if ($scope.onEnd) {
                        myscroll.on('scrollEnd', function() {
                            $scope.$eval($scope.onEnd);
                            $timeout(function() {
                                myscroll.refresh();
                            }, 700);
                        });
                    }
                }, 100);

            }
        };
    }

}());
