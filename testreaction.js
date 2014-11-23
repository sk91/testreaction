(function($, console,undefined){


	this.reaction_test = function(options){
		if(!options.image_container){
			console.log("No images contaier element, creating...")
			options.image_container = $('<div>').addClass('reaction-test-img');
			$('body').append(options.image_container);
		}

		if(!options.results_container){
			console.log("No  results contaier element, creating...")
			options.results_container = $('<div>').addClass('reaction-test-result');
			$('body').append(options.results_container);
		}

		var keys = options.keys || ["A","L"],
			keysMap = {};

		keys.forEach(function (key) {
			keysMap[key.charCodeAt(0)] = key;
		});


		var images = new Images(options.images),
			reaction = new ReactionMessurer(options.reaction_messurer),
			imageView = new ImageView({
				$el: $(options.image_container),
				images: images
			}),
			resultsView = new ResultsView({
				$el: $(options.results_container),
				results: []
			}),
			eventListener = new EventListener(keysMap),
			testRunner = new TestRunner({
				switch_time: options.switch_time || [3,5],
				reaction: reaction,
				image_view: imageView,
				results_view: resultsView,
				event_listener: eventListener,
				jump_on_press: options.jump_on_press || false
			});

		testRunner.start();
	}



	var TestRunner = function(options){
		this.switchTime = options.switch_time;
		this.reaction = options.reaction;
		this.imageView = options.image_view;
		this.resultsView = options.results_view;
		this.eventListener = options.event_listener;
		this.timeout = null;
		this.results = [];
		this.currentResult = null;
		this.immidiateNext = options.jump_on_press;

		this.resultsView.setResults(this.results);
	};

	TestRunner.prototype.start = function(){
		console.log("Strating test");
		this.eventListener.listen();
		this.eventListener.on('test_key_pressed', this.keyPressed.bind(this));
		this.next();
	};

	TestRunner.prototype.next = function(){
		var next = this.imageView.showNext();
		if(this.timeout){
			clearTimeout(this.timeout);
		}
		if(!next){
			return this.stop();
		}
	
		this.currentResult = {
			image: next,
			updated: false,
			reaction: '-',
			key: '-'
		};

		this.results.push(this.currentResult);
		this.resultsView.setResults(this.results);
		this.resultsView.render();

		this.reaction.start();
		this.timeout = setTimeout(
			this.next.bind(this),
			this.calculateRandomSwitchTime()
		);
		console.log('Next stage ' + next.name);
	};



	TestRunner.prototype.stop = function(){
		console.log("Stopping test");
		if(this.timeout){
			clearTimeout(this.timeout);
		}
		this.eventListener.stopListening();
	};

	TestRunner.prototype.keyPressed = function(event, key){
		if(this.currentResult.updated){
			return;
		}

		this.currentResult.updated=true;
		this.currentResult.key = key;
		this.currentResult.reaction = this.reaction.stop();
		this.resultsView.setResults(this.results);
		this.resultsView.render();

		if(this.immidiateNext){
			this.next();
		}
	};

	TestRunner.prototype.calculateRandomSwitchTime = function(){
		var min = this.switchTime[0] * 1000,
			max = this.switchTime[1] * 1000,
			randTime = Math.floor(Math.random() * (max-min+1)) + min;

		console.log("Calculating random switch time", randTime);
		return randTime;
	};


	/////////////////////////////////////////

	var EventListener = function(keys){
		this.keys = keys || {};
	};

	EventListener.prototype.listen = function(){
		this.on('keyup', this.keyPressed.bind(this));
	};

	EventListener.prototype.stopListening = function(){
		this.off('keyup');
		this.off('test_key_pressed');
	};

	EventListener.prototype.keyPressed = function(event){
		if(event.keyCode in this.keys){
			this.trigger('test_key_pressed', this.keys[event.keyCode]);
		}
	};

	EventListener.prototype.off = function(event, callback){
		$('body').off(event,callback);
	}

	EventListener.prototype.on = function(event,callback){
		$('body').on(event,callback);
	};

	EventListener.prototype.trigger = function(event, data){
		$('body').trigger(event,data);
	};

	//////////////////////////////////////////

	var ImageView = function(options){
		this.$el = options.$el;
		this.images = options.images;
		this.image = null;
		this.images.preloadImages();
	};

	ImageView.prototype.showNext = function(){
		if(!this.images.hasNext()){
			return false;
		}
		var nextImage = this.images.next();
		this.image = nextImage;
		this.render();
		return nextImage;
	};

	ImageView.prototype.render = function(){
		if(!this.image){
			return;
		}
		this.$el.html(this.image.element);
	};

	//////////////////////////////////////////
	var ResultsView = function(options){
		this.results = options.results;
		this.$el = options.$el;
	};

	ResultsView.prototype.setResults = function(results){
		this.results = results;
	};

	ResultsView.prototype.render = function(){
		var ul = document.createElement('ul');
		this.results.forEach(function (result) {
			var li = document.createElement('li');
			li.innerHTML = "<span class='image-name'>"+result.image.name+"</span>" + 
				"<span class='reaction'>" + result.reaction + "</span>" +
				"<span class='keyt'>" + result.key + "</span";

			ul.appendChild(li);
		});
		this.$el.html(ul);
	};


	//////////////////////////////////////////

	var Images =  function(images){
		this.images = images || [];
		this.current = -1;
	};

	Images.prototype.preloadImages = function(){
		console.log(this.images);
		this.images.forEach(function (image) {
			var img = new Image();
			img.src = image.src;
			image.element = img;
		});
	};

	Images.prototype.hasNext = function(){
		return this.images.length > this.current + 1;
	};

	Images.prototype.next = function(){
		return this.images[++this.current];
	};

	Images.prototype.reset = function(){
		this.current = -1;
	};


	////////////////////////////////////////


	var ReactionMessurer = function(){
		this._time = 0;
		this._reaction = 0;
	};

	ReactionMessurer.prototype.start = function(){
		console.log("Starting messuring reaction");
		this._time = +new Date();
		this._reaction = 0;
	};	

	ReactionMessurer.prototype.stop = function(){
		console.log("Stopping messuring reaction");
		this._reaction = +new Date() - this._time;
		this._time = null;
		return this.getReaction();
	};

	ReactionMessurer.prototype.getReaction = function(){
		return this._reaction;
	};

})(jQuery,console)