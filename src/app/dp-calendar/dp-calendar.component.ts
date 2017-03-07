import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {CalendarService} from './service/calendar.service';
import {ICalendarConfig} from './config/calendar-config.model';
import {ICalendarDay} from './config/day.model';
import {Moment} from 'moment';

@Component({
  selector: 'dp-calendar',
  templateUrl: './dp-calendar.component.html',
  styleUrls: ['./dp-calendar.component.less'],
  providers: [CalendarService]
})
export class DpCalendarComponent implements OnInit, OnChanges {
  @Input() config: ICalendarConfig;
  @Input() selected: Moment[];
  @Output('on-change') dateClicked = new EventEmitter();
  weeks: ICalendarDay[][];
  weekdays: string[];

  constructor(private calendarService: CalendarService) {
  }

  ngOnInit() {
    this.weeks = this.calendarService.generateMonthArray(this.config.firstDayOfWeek, this.config.month,
      this.selected);
    this.weekdays = this.calendarService.generateWeekdays(this.config.firstDayOfWeek, this.config.weekdayNames);
  }

  ngOnChanges(changes: SimpleChanges) {
    const {selected} = changes;
    if (selected && !selected.isFirstChange()) {
      this.weeks = this.calendarService.generateMonthArray(this.config.firstDayOfWeek, this.config.month,
        this.selected);
    }
  }

  isDisabledDay(day: ICalendarDay) {
    return this.calendarService.isDateDisabled(day, this.config);
  }

  dateClick(day: ICalendarDay) {
    this.dateClicked.emit({day});
  }
}
