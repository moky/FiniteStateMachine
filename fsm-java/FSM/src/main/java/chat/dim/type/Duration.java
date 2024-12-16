/* license: https://mit-license.org
 *
 *  Finite State Machine
 *
 *                                Written in 2024 by Moky <albert.moky@gmail.com>
 *
 * ==============================================================================
 * The MIT License (MIT)
 *
 * Copyright (c) 2024 Albert Moky
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ==============================================================================
 */
package chat.dim.type;

import java.io.Serializable;
import java.util.Date;

/**
 *  A span of time
 *  ~~~~~~~~~~~~~~
 *  such as 27 days, 4 hours, 12 minutes, and 3 seconds.
 */
public final class Duration implements Comparable<Duration>, Serializable {

    public static final Duration ZERO = new Duration(0);

    private final long millis;

    public Duration(long millis) {
        this.millis = millis;
    }

    public long inMilliseconds() {
        return millis;
    }

    /**
     * Compares this duration to the specified {@code Duration}.
     * <p>
     * The comparison is based on the total length of the durations.
     * It is "consistent with equals", as defined by {@link Comparable}.
     *
     * @param other  the other duration to compare to, not null
     * @return the comparator value, negative if less, positive if greater
     */
    @Override
    public int compareTo(Duration other) {
        return Long.compare(millis, other.inMilliseconds());
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof Duration &&
                millis == ((Duration) other).inMilliseconds();
    }

    @Override
    public int hashCode() {
        return Long.hashCode(millis);
    }

    /**
     * A string representation of this duration using ISO-8601 seconds
     * based representation, such as {@code PT8H6M12.345S}.
     * <p>
     * The format of the returned string will be {@code PTnHnMnS}, where n is
     * the relevant hours, minutes or seconds part of the duration.
     * Any fractional seconds are placed after a decimal point i the seconds section.
     * If a section has a zero value, it is omitted.
     * The hours, minutes and seconds will all have the same sign.
     * <p>
     * Examples:
     * <pre>
     *    "20.345 seconds"                 -- "PT20.345S
     *    "15 minutes" (15 * 60 seconds)   -- "PT15M"
     *    "10 hours" (10 * 3600 seconds)   -- "PT10H"
     *    "2 days" (2 * 86400 seconds)     -- "PT48H"
     * </pre>
     * Note that multiples of 24 hours are not output as days to avoid confusion
     * with {@code Period}.
     *
     * @return an ISO-8601 representation of this duration, not null
     */
    @Override
    public String toString() {
        if (isZero()) {
            return "PT0S";
        }
        long hours = millis / MILLIS_PER_HOUR;
        long minutes = (millis % MILLIS_PER_HOUR) / MILLIS_PER_MINUTE;
        long secs = (millis % MILLIS_PER_MINUTE) / MILLIS_PER_SECOND;
        long ms = millis % MILLIS_PER_SECOND;
        StringBuilder buf = new StringBuilder();
        buf.append("PT");
        if (hours != 0) {
            buf.append(hours).append('H');
        }
        if (minutes != 0) {
            buf.append(minutes).append('M');
        }
        // seconds
        if (secs == 0 && ms == 0 && buf.length() > 2) {
            return buf.toString();
        } else if (secs >= 0 || ms <= 0) {
            buf.append(secs);
        } else if (secs == -1) {
            buf.append("-0");
        } else {
            buf.append(secs + 1);
        }
        // milliseconds
        if (ms > 0) {
            int pos = buf.length();
            if (secs < 0) {
                buf.append(2 * MILLIS_PER_SECOND - ms);
            } else {
                buf.append(ms + MILLIS_PER_SECOND);
            }
            while (buf.charAt(buf.length() - 1) == '0') {
                buf.setLength(buf.length() - 1);
            }
            buf.setCharAt(pos, '.');
        }
        buf.append('S');
        return buf.toString();
    }

    public boolean isZero() {
        return millis == 0;
    }

    public boolean isPositive() {
        return millis > 0;
    }

    public boolean isNegative() {
        return millis < 0;
    }

    public Duration negated() {
        return new Duration(-millis);
    }

    public Duration abs() {
        return isNegative() ? negated() : this;
    }

    //
    //  +
    //

    public Duration plus(Duration duration) {
        return plusMilliseconds(duration.inMilliseconds());
    }

    public Duration plusMilliseconds(long milliseconds) {
        return milliseconds == 0 ? this :
                new Duration(millis + milliseconds);
    }

    public Duration plusSeconds(long seconds) {
        return seconds == 0 ? this :
                new Duration(millis + MILLIS_PER_SECOND * seconds);
    }

    public Duration plusMinutes(int minutes) {
        return minutes == 0 ? this :
                new Duration(millis + MILLIS_PER_MINUTE * minutes);
    }

    public Duration plusHours(int hours) {
        return hours == 0 ? this :
                new Duration(millis + MILLIS_PER_HOUR * hours);
    }

    public Duration plusDays(int days) {
        return days == 0 ? this :
                new Duration(millis + MILLIS_PER_DAY * days);
    }

    //
    //  -
    //

    public Duration minus(Duration duration) {
        return plusMilliseconds(-duration.inMilliseconds());
    }

    public Duration minusMilliseconds(long milliseconds) {
        return plusMilliseconds(-milliseconds);
    }

    public Duration minusSeconds(long seconds) {
        return plusSeconds(-seconds);
    }

    public Duration minusMinutes(int minutes) {
        return plusMinutes(-minutes);
    }

    public Duration minusHours(int hours) {
        return plusHours(-hours);
    }

    public Duration minusDays(int days) {
        return plusDays(-days);
    }

    //
    //  *, /
    //

    public Duration multiply(long multiplicand) {
        if (multiplicand == 0) {
            return ZERO;
        } else if (multiplicand == 1) {
            return this;
        }
        return new Duration(millis * multiplicand);
    }

    public Duration divide(long divisor) {
        if (divisor == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        } else if (divisor == 1) {
            return this;
        }
        return new Duration(millis / divisor);
    }

    //
    //  DateTime
    //

    public Date addTo(Date time) {
        return new Date(time.getTime() + millis);
    }

    public Date subtractFrom(Date time) {
        return new Date(time.getTime() - millis);
    }

    /**
     * Hours per day.
     */
    public static final int HOURS_PER_DAY = 24;
    /**
     * Minutes per hour.
     */
    public static final int MINUTES_PER_HOUR = 60;
    /**
     * Seconds per minute.
     */
    public static final int SECONDS_PER_MINUTE = 60;
    /**
     * Milliseconds per second.
     */
    public static final long MILLIS_PER_SECOND = 1000L;
    /**
     * Milliseconds per minute.
     */
    public static final long MILLIS_PER_MINUTE = MILLIS_PER_SECOND * SECONDS_PER_MINUTE;
    /**
     * Milliseconds per hour.
     */
    public static final long MILLIS_PER_HOUR = MILLIS_PER_MINUTE * MINUTES_PER_HOUR;
    /**
     * Milliseconds per day.
     */
    public static final long MILLIS_PER_DAY = MILLIS_PER_HOUR * HOURS_PER_DAY;

    //
    //  Factories
    //

    public static Duration ofMilliseconds(long milliseconds) {
        return new Duration(milliseconds);
    }

    public static Duration ofSeconds(long seconds) {
        return new Duration(MILLIS_PER_SECOND * seconds);
    }

    public static Duration ofMinutes(int minutes) {
        return new Duration(MILLIS_PER_MINUTE * minutes);
    }

    public static Duration ofHours(int hours) {
        return new Duration(MILLIS_PER_HOUR * hours);
    }

    public static Duration ofDays(int days) {
        return new Duration(MILLIS_PER_DAY * days);
    }

    /**
     *  The result of this method can be a negative period if the end is before the start.
     */
    public static Duration between(Date startTime, Date endTime) {
        return new Duration(endTime.getTime() - startTime.getTime());
    }

}
