Simple Reaction Test Script
============================

The script will switch images and the test subject will have to quickly deside between two options  by pressing a key (by default its 'A' and 'L')


Usage
------

````javascript
    $(function(){
      reaction_test({
        jump_on_press: true, //optional default false
        image_container: '.image_container', //optional
        results_container: '.results_container', //optional
        keys: ["A","L"], //optional, default ["A", "L"]
        switch_time: [3,5], //optional, default [3,5] (a reandom between 3 and 5 seconds)

        images: [
          {
            name: "Red Image",
            src: 'images/1.jpg'
          },
          {
            name: "Blue Image",
            src: 'images/2.jpg'
          },
          {
            name: "Green Image",
            src: 'images/3.jpg'
          },
          {
            name: "Purple Image",
            src: 'images/4.jpg'
          }
        ]
      });
    });

````
