'use strict';
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2025 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require 'namespace.js'

    /// The number of milliseconds per second.
    var MILLISECONDS_PER_SECOND = 1000;

    /// The number of seconds per minute.
    ///
    /// Notice that some minutes of official clock time might
    /// differ in length because of leap seconds.
    /// The [Duration] and [DateTime] classes ignore leap seconds
    /// and consider all minutes to have 60 seconds.
    var SECONDS_PER_MINUTE      = 60;

    /// The number of minutes per hour.
    var MINUTES_PER_HOUR        = 60;

    /// The number of hours per day.
    ///
    /// Notice that some days may differ in length because
    /// of time zone changes due to daylight saving.
    /// The [Duration] class is time zone agnostic and
    /// considers all days to have 24 hours.
    var HOURS_PER_DAY           = 24;

    var MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
    var MILLISECONDS_PER_HOUR   = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
    var MILLISECONDS_PER_DAY    = MILLISECONDS_PER_HOUR   * HOURS_PER_DAY;

    /**
     *  Time Duration
     */
    fsm.type.Duration = function (duration) {
        var days         = Converter.getInt(duration['days'],         0);
        var hours        = Converter.getInt(duration['hours'],        0);
        var minutes      = Converter.getInt(duration['minutes'],      0);
        var seconds      = Converter.getInt(duration['seconds'],      0);
        var milliseconds = Converter.getInt(duration['milliseconds'], 0);

        this.__millis = milliseconds +
            MILLISECONDS_PER_SECOND * seconds +
            MILLISECONDS_PER_MINUTE * minutes +
            MILLISECONDS_PER_HOUR   * hours +
            MILLISECONDS_PER_DAY    * days;
    };
    var Duration = fsm.type.Duration;

    /// The number of whole milliseconds spanned by this [Duration].
    ///
    /// The returned value can be greater than 999.
    /// For example, a duration of three seconds and 125 milliseconds
    /// has 3125 milliseconds.
    /// ```dart
    /// const duration = Duration(seconds: 3, milliseconds: 125);
    /// print(duration.inMilliseconds); // 3125
    /// ```
    Duration.prototype.inMilliseconds = function () {
        return this.__millis;
    };

    /// Whether this [Duration] has the same length as [other].
    ///
    /// Durations have the same length if they have the same number
    /// of milliseconds.
    Duration.prototype.equals = function (other) {
        return this.__millis === get_millis(other);
    };

    /// Whether this [Duration] is shorter than [other].
    Duration.prototype.shorterThan = function (other) {
        return this.__millis < get_millis(other);
    };

    /// Whether this [Duration] is longer than [other].
    Duration.prototype.longerThan = function (other) {
        return this.__millis > get_millis(other);
    };

    /// Whether this [Duration] is shorter than or equal to [other].
    Duration.prototype.shorterOrEqual = function (other) {
        return this.__millis <= get_millis(other);
    };

    /// Whether this [Duration] is longer than or equal to [other].
    Duration.prototype.longerOrEqual = function (other) {
        return this.__millis >= get_millis(other);
    };

    /// Creates a new [Duration] representing the absolute length of this
    /// [Duration].
    ///
    /// The returned [Duration] has the same length as this one, but is always
    /// positive where possible.
    Duration.prototype.abs = function () {
        return create_duration(Math.abs(this.__millis));
    };

    Duration.prototype.negated = function () {
        return create_duration(0 - this.__millis);
    };

    Duration.prototype.isNegative = function () {
        return this.__millis < 0;
    };

    Duration.prototype.isPositive = function () {
        return this.__millis > 0;
    };

    Duration.prototype.isZero = function () {
        return this.__millis === 0;
    };

    /// Adds this Duration and [other] and
    /// returns the sum as a new Duration object.
    Duration.prototype.adds = function (other) {
        return create_duration(this.__millis + get_millis(other));
    };

    /// Subtracts [other] from this Duration and
    /// returns the difference as a new Duration object.
    Duration.prototype.subtracts = function (other) {
        return create_duration(this.__millis - get_millis(other));
    };

    /// Multiplies this Duration by the given [factor] and returns the result
    /// as a new Duration object.
    ///
    /// Note that when [factor] is a double, and the duration is greater than
    /// 53 bits, precision is lost because of double-precision arithmetic.
    Duration.prototype.multiplies = function (factor) {
        return create_duration(Math.round(this.__millis * factor));
    };

    /// Divides this Duration by the given [quotient] and returns the truncated
    /// result as a new Duration object.
    ///
    /// The [quotient] must not be `0`.
    Duration.prototype.divides = function (quotient) {
        return create_duration(Math.floor(this.__millis / quotient));
    };

    var get_millis = function (duration) {
        if (Interface.conforms(duration, Duration)) {
            return duration.inMilliseconds();
        } else {
            return Converter.getInt(duration, 0);
        }
    };
    var create_duration = function (millis) {
        return new Duration({
            'milliseconds': millis
        });
    };

    //
    //  Factories
    //

    Duration.ofMilliseconds = function (millis) {
        return create_duration(millis * 1);
    };

    Duration.ofSeconds = function (seconds) {
        return create_duration(MILLISECONDS_PER_SECOND * seconds);
    };

    Duration.ofMinutes = function (minutes) {
        return create_duration(MILLISECONDS_PER_MINUTE * minutes);
    };

    Duration.ofHours = function (hours) {
        return create_duration(MILLISECONDS_PER_HOUR * hours);
    };

    Duration.ofDays = function (days) {
        return create_duration(MILLISECONDS_PER_DAY * days);
    };

    /**
     *  The result of this method can be a negative period if the end is before the start.
     *
     * @param {Date} startTime
     * @param {Date} endTime
     * @return {Duration}
     */
    Duration.between = function (startTime, endTime) {
        return create_duration(endTime.getTime() - startTime.getTime());
    };

    //
    //  DateTime
    //

    /**
     *  Adds this duration to a time
     *
     * @param {Date} time
     * @return {Date}
     */
    Duration.prototype.addTo = function (time) {
        return new Date(time.getTime() + this.__millis);
    };

    /**
     *  Subtracts this duration from a time
     *
     * @param {Date} time
     * @return {Date}
     */
    Duration.prototype.subtractFrom = function (time) {
        return new Date(time.getTime() - this.__millis);
    };
;