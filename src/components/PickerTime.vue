<template>
  <div :class="[calendarClass, 'vdp-datepicker__time']"
       v-show="showTimeView"
       :style="calendarStyle"
       @mousedown.prevent>
    <slot name="beforeCalendarHeader"></slot>
    <header>
      <span @click="isRtl ? nextDay() : previousDay()"
            class="prev"
            :class="{'disabled': isLeftNavDisabled}">&lt;</span>
      <span class="day__month_btn"
            @click="showDayCalendar"
            :class="allowedToShowView('day') ? 'up' : ''">{{ formattedValue }}</span>
      <span @click="isRtl ? previousDay() : nextDay()"
            class="next"
            :class="{'disabled': isRightNavDisabled}">&gt;</span>
    </header>
    <div :class="isRtl ? 'flex-rtl' : ''">
      TIME
      <!-- <span class="cell day-header"
            v-for="d in daysOfWeek"
            :key="d.timestamp">{{ d }}</span>
      <template v-if="blankDays > 0">
        <span class="cell day blank"
              v-for="d in blankDays"
              :key="d.timestamp"></span>
      </template>
      <span class="cell day"
            v-for="day in days"
            :key="day.timestamp"
            :class="dayClasses(day)"
            v-html="dayCellContent(day)"
            @click="selectDate(day)"></span> -->
    </div>
  </div>
</template>
<script>
import { makeDateUtils } from '../utils/DateUtils'
export default {
  props: {
    showTimeView: Boolean,
    selectedDate: Date,
    pageDate: Date,
    pageTimestamp: Number,
    format: [String, Function],
    allowedToShowView: Function,
    dayCellContent: {
      type: Function,
      default: day => day.date
    },
    disabledDates: Object,
    highlighted: Object,
    calendarClass: [String, Object, Array],
    calendarStyle: Object,
    translation: Object,
    isRtl: Boolean,
    mondayFirst: Boolean,
    useUtc: Boolean
  },
  data () {
    const constructedDateUtils = makeDateUtils(this.useUtc)
    return {
      utils: constructedDateUtils
    }
  },
  computed: {
    formattedValue () {
      if (!this.pageDate) {
        return null
      }
      if (this.typedDate) {
        return this.typedDate
      }
      return typeof this.format === 'function'
        ? this.format(this.pageDate)
        : this.utils.formatDate(
            new Date(this.pageDate),
            this.format,
            this.translation
          )
    },

    /**
     * Is the left hand navigation button disabled?
     * @return {Boolean}
     */
    isLeftNavDisabled () {
      return this.isRtl
        ? this.isNextDayDisabled(this.pageTimestamp)
        : this.isPreviousDayDisabled(this.pageTimestamp)
    },
    /**
     * Is the right hand navigation button disabled?
     * @return {Boolean}
     */
    isRightNavDisabled () {
      return this.isRtl
        ? this.isPreviousDayDisabled(this.pageTimestamp)
        : this.isNextDayDisabled(this.pageTimestamp)
    }
  },
  methods: {
    selectDate (date) {
      if (date.isDisabled) {
        this.$emit('selectedDisabled', date)
        return false
      }
      this.$emit('selectDate', date)
    },
    /**
     * @return {Number}
     */
    getPageDay () {
      return this.utils.getDay(this.pageDate)
    },
    /**
     * Emit an event to show the month picker
     */
    showDayCalendar () {
      this.$emit('showDayCalendar')
    },
    /**
     * Change the page month
     * @param {Number} incrementBy
     */
    changeDay (incrementBy) {
      let date = this.pageDate
      this.utils.setDate(date, this.utils.getDay(date) + incrementBy)
      this.$emit('changedDay', date) // old changedMonth
    },
    /**
     * Decrement the page month
     */
    previousDay () {
      if (!this.isPreviousDayDisabled()) {
        this.changeDay(-1)
      }
    },
    /**
     * Is the previous month disabled?
     * @return {Boolean}
     */
    isPreviousDayDisabled () {
      if (!this.disabledDates || !this.disabledDates.to) {
        return false
      }
      let d = this.pageDate
      return (
        this.utils.getDay(this.disabledDates.to) >= this.utils.getDay(d) &&
        this.utils.getMonth(this.disabledDates.to) >= this.utils.getMonth(d) &&
        this.utils.getFullYear(this.disabledDates.to) >=
          this.utils.getFullYear(d)
      )
    },
    /**
     * Increment the current page month
     */
    nextDay () {
      if (!this.isNextDayDisabled()) {
        this.changeDay(+1)
      }
    },
    /**
     * Is the next month disabled?
     * @return {Boolean}
     */
    isNextDayDisabled () {
      if (!this.disabledDates || !this.disabledDates.from) {
        return false
      }
      let d = this.pageDate
      return (
        this.utils.getDay(this.disabledDates.from) <= this.utils.getDay(d) &&
        this.utils.getMonth(this.disabledDates.from) <=
          this.utils.getMonth(d) &&
        this.utils.getFullYear(this.disabledDates.from) <=
          this.utils.getFullYear(d)
      )
    },
    /**
     * Whether a day is selected
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedDate (dObj) {
      return (
        this.selectedDate && this.utils.compareDates(this.selectedDate, dObj)
      )
    },
    /**
     * Whether a day is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledDate (date) {
      let disabledDates = false

      if (typeof this.disabledDates === 'undefined') {
        return false
      }

      if (typeof this.disabledDates.dates !== 'undefined') {
        this.disabledDates.dates.forEach(d => {
          if (this.utils.compareDates(date, d)) {
            disabledDates = true
            return true
          }
        })
      }
      if (
        typeof this.disabledDates.to !== 'undefined' &&
        this.disabledDates.to &&
        date < this.disabledDates.to
      ) {
        disabledDates = true
      }
      if (
        typeof this.disabledDates.from !== 'undefined' &&
        this.disabledDates.from &&
        date > this.disabledDates.from
      ) {
        disabledDates = true
      }
      if (typeof this.disabledDates.ranges !== 'undefined') {
        this.disabledDates.ranges.forEach(range => {
          if (
            typeof range.from !== 'undefined' &&
            range.from &&
            typeof range.to !== 'undefined' &&
            range.to
          ) {
            if (date < range.to && date > range.from) {
              disabledDates = true
              return true
            }
          }
        })
      }
      if (
        typeof this.disabledDates.days !== 'undefined' &&
        this.disabledDates.days.indexOf(this.utils.getDay(date)) !== -1
      ) {
        disabledDates = true
      }
      if (
        typeof this.disabledDates.daysOfMonth !== 'undefined' &&
        this.disabledDates.daysOfMonth.indexOf(this.utils.getDate(date)) !== -1
      ) {
        disabledDates = true
      }
      if (
        typeof this.disabledDates.customPredictor === 'function' &&
        this.disabledDates.customPredictor(date)
      ) {
        disabledDates = true
      }
      return disabledDates
    },
    /**
     * Whether a day is highlighted (only if it is not disabled already except when highlighted.includeDisabled is true)
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightedDate (date) {
      if (
        !(this.highlighted && this.highlighted.includeDisabled) &&
        this.isDisabledDate(date)
      ) {
        return false
      }

      let highlighted = false

      if (typeof this.highlighted === 'undefined') {
        return false
      }

      if (typeof this.highlighted.dates !== 'undefined') {
        this.highlighted.dates.forEach(d => {
          if (this.utils.compareDates(date, d)) {
            highlighted = true
            return true
          }
        })
      }

      if (
        this.isDefined(this.highlighted.from) &&
        this.isDefined(this.highlighted.to)
      ) {
        highlighted =
          date >= this.highlighted.from && date <= this.highlighted.to
      }

      if (
        typeof this.highlighted.days !== 'undefined' &&
        this.highlighted.days.indexOf(this.utils.getDay(date)) !== -1
      ) {
        highlighted = true
      }

      if (
        typeof this.highlighted.daysOfMonth !== 'undefined' &&
        this.highlighted.daysOfMonth.indexOf(this.utils.getDate(date)) !== -1
      ) {
        highlighted = true
      }

      if (
        typeof this.highlighted.customPredictor === 'function' &&
        this.highlighted.customPredictor(date)
      ) {
        highlighted = true
      }

      return highlighted
    },
    dayClasses (day) {
      return {
        selected: day.isSelected,
        disabled: day.isDisabled,
        highlighted: day.isHighlighted,
        today: day.isToday,
        weekend: day.isWeekend,
        sat: day.isSaturday,
        sun: day.isSunday,
        'highlight-start': day.isHighlightStart,
        'highlight-end': day.isHighlightEnd
      }
    },
    /**
     * Whether a day is highlighted and it is the first date
     * in the highlighted range of dates
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightStart (date) {
      return (
        this.isHighlightedDate(date) &&
        this.highlighted.from instanceof Date &&
        this.utils.getFullYear(this.highlighted.from) ===
          this.utils.getFullYear(date) &&
        this.utils.getMonth(this.highlighted.from) ===
          this.utils.getMonth(date) &&
        this.utils.getDate(this.highlighted.from) === this.utils.getDate(date)
      )
    },
    /**
     * Whether a day is highlighted and it is the first date
     * in the highlighted range of dates
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightEnd (date) {
      return (
        this.isHighlightedDate(date) &&
        this.highlighted.to instanceof Date &&
        this.utils.getFullYear(this.highlighted.to) ===
          this.utils.getFullYear(date) &&
        this.utils.getMonth(this.highlighted.to) ===
          this.utils.getMonth(date) &&
        this.utils.getDate(this.highlighted.to) === this.utils.getDate(date)
      )
    },
    /**
     * Helper
     * @param  {mixed}  prop
     * @return {Boolean}
     */
    isDefined (prop) {
      return typeof prop !== 'undefined' && prop
    }
  }
}
// eslint-disable-next-line
</script>
