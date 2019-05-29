(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

// MODULES //

var dot = require( 'compute-dot' ),
	l2norm = require( 'compute-l2norm' ),
	isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// FUNCTIONS //

/**
 * FUNCTION: partial( fn, j )
 *	Partially applied function from the right.
 *
 * @private
 * @param {Function} fn - input function
 * @param {Number} j - array index
 * @returns {Function} partially applied function
 */
function partial( fn, j ) {
	return function accessor( d, i ) {
		return fn( d, i, j );
	};
} // end FUNCTION partial()


// COSINE SIMILARITY //

/**
* FUNCTION: similarity( x, y[, accessor] )
*	Computes the cosine similarity between two arrays.
*
* @param {Number[]|Array} x - input array
* @param {Number[]|Array} y - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} cosine similarity or null
*/
function similarity( x, y, clbk ) {
	var a, b, c;
	if ( !isArray( x ) ) {
		throw new TypeError( 'cosine-similarity()::invalid input argument. First argument must be an array. Value: `' + x + '`.' );
	}
	if ( !isArray( y ) ) {
		throw new TypeError( 'cosine-similarity()::invalid input argument. Second argument must be an array. Value: `' + y + '`.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'cosine-similarity()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	if ( x.length !== y.length ) {
		throw new Error( 'cosine-similarity()::invalid input argument. Input arrays must have the same length.' );
	}
	if ( !x.length ) {
		return null;
	}
	if ( clbk ) {
		a = dot( x, y, clbk );
		b = l2norm( x, partial( clbk, 0 ) );
		c = l2norm( y, partial( clbk, 1 ) );
	} else {
		a = dot( x, y );
		b = l2norm( x );
		c = l2norm( y );
	}
	return a / ( b*c );
} // end FUNCTION similarity()


// EXPORTS //

module.exports = similarity;

},{"compute-dot":2,"compute-l2norm":3,"validate.io-array":4,"validate.io-function":5}],2:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// DOT PRODUCT //

/**
* FUNCTION: dot( x, y[, accessor] )
*	Computes the dot product between two arrays.
*
* @param {Array} x - input array
* @param {Array} y - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} dot product
*/
function dot( x, y, clbk ) {
	if ( !isArray( x ) ) {
		throw new TypeError( 'dot()::invalid input argument. First argument must be an array. Value: `' + x + '`.' );
	}
	if ( !isArray( y ) ) {
		throw new TypeError( 'dot()::invalid input argument. Second argument must be an array. Value: `' + y + '`.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'dot()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	var len = x.length,
		sum = 0,
		i;

	if ( len !== y.length ) {
		throw new Error( 'dot()::invalid input argument. Arrays must be of equal length.' );
	}
	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			sum += clbk( x[ i ], i, 0 ) * clbk( y[ i ], i, 1 );
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			sum += x[ i ] * y[ i ];
		}
	}
	return sum;
} // end FUNCTION dot()


// EXPORTS //

module.exports = dot;

},{"validate.io-array":4,"validate.io-function":5}],3:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// L2NORM //

/**
* FUNCTION: l2norm( arr[, accessor] )
*	Calculates the L2 norm (Euclidean norm) of an array.
*
* @param {Array} arr - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} L2 norm or null
*/
function l2norm( arr, clbk ) {
	if ( !isArray( arr ) ) {
		throw new TypeError( 'l2norm()::invalid input argument. Must provide an array.  Value: `' + arr + '`.' );
	}
	if ( arguments.length > 1 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'l2norm()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	var len = arr.length,
		t = 0,
		s = 1,
		r,
		val,
		abs,
		i;

	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			val = clbk( arr[ i ], i );
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			val = arr[ i ];
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	}
	return t * Math.sqrt( s );
} // end FUNCTION l2norm()


// EXPORTS //

module.exports = l2norm;

},{"validate.io-array":4,"validate.io-function":5}],4:[function(require,module,exports){
'use strict';

/**
* FUNCTION: isArray( value )
*	Validates if a value is an array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an array
*/
function isArray( value ) {
	return Object.prototype.toString.call( value ) === '[object Array]';
} // end FUNCTION isArray()

// EXPORTS //

module.exports = Array.isArray || isArray;

},{}],5:[function(require,module,exports){
/**
*
*	VALIDATE: function
*
*
*	DESCRIPTION:
*		- Validates if a value is a function.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isFunction( value )
*	Validates if a value is a function.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a function
*/
function isFunction( value ) {
	return ( typeof value === 'function' );
} // end FUNCTION isFunction()


// EXPORTS //

module.exports = isFunction;

},{}]},{},[1]);
