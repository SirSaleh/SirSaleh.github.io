

class RangeRider{
	/**
	 * Base class for RangeRider
	 * @param {String} holderID the ID of HTML element holder of range selector
	 * @param {Function} shapeFunc function of shape (expect to accept one argument and return a function a number)
	 * @param {Number} funcStart startPoint for the range shape
	 * @param {Number} funcEnd endPoint for the range shape
	 * @param {Number} strokeWidth width of the stroke of range shape
	 * @param {Number} progressStrokeWidth width of the progress of range shape
	 * @param {String} progressStrokeColor color of the progress path
	 * @param {Number} SVGWidth Width of the svg element
	 * @param {Number} SVGHeight Height of the svg element
	 * @param {Function} sliderChangeCallback callback function to call when the value changes (accepts newPercentageValue as argument)
	 */

	constructor({holderID, shapeFunc= Math.sin,funcStart=0, funcEnd=6.28, strokeWidth=10, progressStrokeWidth= 10,
				strokeColor="#000000", progressStrokeColor="#ff0000",
				percentageValue=0, sliderChangeCallback=(newPercentageValue)=>{}} = {}){
		/**
		 * constructor of RangeRider
		 * @argument {String} holderID the ID of HTML element holder of range selector
		 * @argument {Function} shapeFunc function of shape (expect to accept one argument and return a function a number)
		 * @argument {Number} funcStart startPoint for the range shape
		 * @argument {Number} funcEnd endPoint for the range shape
		 * @argument {Number} strokeWidth width of the stroke of range shape
		 * @argument {String} strokeColor color of the stroke (default black "#000000")
		 * @argument {Number} progressStrokeWidth width of the progress path
		 * @argument {String} progressStrokeColor color of the progress path
		 * @argument {Function} sliderChangeCallback callback function to call when the value changes (accepts newPercentageValue as argument)
		 * @returns {null}
		 */
		this.segments = 1000;
		this.shapeFunc = shapeFunc
		this.funcStart = funcStart
		this.funcEnd = funcEnd
		this.strokeColor = strokeColor
		this.progressStrokeWidth = progressStrokeWidth
		this.progressStrokeColor = progressStrokeColor
		this.sliderChangeCallback = sliderChangeCallback

		this.holderElement = document.getElementById(holderID);
		this.svgHolder = null
		this.pathGroup = null;

		this.strokeWidth = strokeWidth
		this.SVGWidth = this.holderElement.clientWidth;
		this.SVGHeight = this.holderElement.clientHeight;

		this.percentageValue = percentageValue
		this.amplitudeMultiplier = this.getAmplitudeMultiplier()

		this.clickHold = false;
	}

	clientYFromCartX(CartesianX){
		return this.svgHolder.clientHeight - (this.amplitudeMultiplier * this.shapeFunc(CartesianX) + this.SVGHeight /2)
	}

	getAmplitudeMultiplier(){
		/**
		 * get amplitude multiplier of the DrawFunc based on the holderSize
		 */
		return (this.SVGHeight - this.strokeWidth) / 2
	}

	stepToCartX(step){
		return step / this.segments * (this.funcEnd - this.funcStart)
	}

	clientToCartRatio(step){
		return this.SVGWidth / (this.funcEnd - this.funcStart)
	}

	PercentageToClientX(percentage){
		return this.svgHolder.clientWidth * percentage / 100
	}

	PercentageToCartX(percentage){
		let ratio = percentage/100;
		let step = Math.floor(this.segments * ratio);
		return this.stepToCartX(step);
	}

	PercentageToClientY(percentage){
		return this.clientYFromCartX(this.PercentageToCartX(percentage));
	}

	describeFuncPath({percentage=100}={}){
		let path = []
		let ratio = percentage / 100
		let currentOffsetX = 0;
		let NextOffsetX = 0;
		let xAxisRatio = this.clientToCartRatio();

		for (let i=0; i<ratio * this.segments; i++){
			currentOffsetX = this.stepToCartX(i);
			NextOffsetX = this.stepToCartX(i+1);
			path.push(
				'M', xAxisRatio * currentOffsetX + this.strokeWidth/2, this.clientYFromCartX(currentOffsetX),
				'L', xAxisRatio * NextOffsetX + this.strokeWidth/2, this.clientYFromCartX(NextOffsetX)
			)
		}

		return path.join(" ")
	}

	draw(){
		this.svgHolder = this.holderElement
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		this.progressPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		this.pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', this.SVGWidth + this.strokeWidth  + "px");
        svg.setAttribute('height', this.SVGHeight + this.strokeWidth  + "px");
		path.setAttribute('d', this.describeFuncPath());
		this.progressPath.setAttribute('d', this.describeFuncPath({percentage: this.percentageValue}));
		this.progressPath.style.stroke =  this.progressStrokeColor;
		this.progressPath.style.strokeWidth = this.progressStrokeWidth;
		path.style.stroke = this.strokeColor;
		path.style.strokeWidth = this.strokeWidth;
		this.pathGroup.appendChild(path);
		this.pathGroup.appendChild(this.progressPath);
		this.svgHolder.replaceChildren(svg);
		svg.appendChild(this.pathGroup);
		this.svg = svg;
		this.svgHolder.style.cursor = "pointer";
		this.drawHandler()

		this.svgHolder.addEventListener("click", this.singleClick.bind(this), false);
		this.svgHolder.addEventListener("mousedown", this.clickDown.bind(this), false);
		this.svgHolder.addEventListener("touchstart", this.clickDown.bind(this), false);
		this.svgHolder.addEventListener('mousemove', this.clickMove.bind(this), false);
        this.svgHolder.addEventListener('touchmove', this.clickMove.bind(this), false);

		window.addEventListener("mouseup", this.clickUp.bind(this), false);
		window.addEventListener('touchend', this.clickUp.bind(this), false);
	}

	singleClick(event){
		this.clickHold = true;

		this.clickMove(event);

		this.clickHold = false;
	}

	clickDown(event){
		this.clickHold = true;
	}

	clickUp(event){
		this.clickHold = false;
	}

	boundValue(value, lowerBound, upperBound){
		if (value > upperBound) value = upperBound;
		if (value < lowerBound)	value = lowerBound;
		return value;
	}

	clickMove(event){
		if (!this.clickHold) return;
		let coords = this.getRatioCoords (event)
		this.percentageValue = this.boundValue(coords[0] * 100, 0 ,100)
		this.sliderChangeCallback(this.percentageValue)
		this.handle.setAttribute('cx', this.PercentageToClientX(this.percentageValue) + this.strokeWidth/2);
        this.handle.setAttribute('cy', this.PercentageToClientY(this.percentageValue));
		this.progressPath.setAttribute('d', this.describeFuncPath({percentage: this.percentageValue}));
	}

	drawHandler(){
		this.handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.handle.setAttribute('class', 'sliderHandle');
        this.handle.setAttribute('r', this.strokeWidth/2);

        this.handle.style.stroke = "#ff0000";
        this.handle.style.strokeWidth = 1;
        this.handle.style.fill = "#ff0000";

        this.pathGroup.appendChild(this.handle);

		this.handle.setAttribute('cx', this.PercentageToClientX(this.percentageValue) + this.strokeWidth/2);
        this.handle.setAttribute('cy', this.PercentageToClientY(this.percentageValue));
	}

	getRatioCoords(event){
		let x, y, clientX, clientY;
		event.preventDefault();
        if (window.TouchEvent && event instanceof TouchEvent){
			// for touch devices
            clientX = event.touches[0].pageX - window.scrollX;
            clientY = event.touches[0].pageY - window.scrollY;
        }else {
			// for mouse or touchpad devices
            clientX = event.clientX;
            clientY = event.clientY;
        }
		let boundingSVGHolder = this.svgHolder.getBoundingClientRect();
		x = clientX - boundingSVGHolder.left;
        y = clientY - boundingSVGHolder.top;

		return [x/boundingSVGHolder.width, y/boundingSVGHolder.height];
	}

	generate(){
		this.draw();
	}
}


