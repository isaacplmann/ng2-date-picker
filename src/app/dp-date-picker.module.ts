import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DpDayPickerComponent} from './dp-day-picker/dp-day-picker.component';
export {DpDayPickerComponent} from './dp-day-picker/dp-day-picker.component'
import {DpCalendarMonthComponent} from './dp-calendar-month/dp-calendar-month.component';
export {DpCalendarMonthComponent} from './dp-calendar-month/dp-calendar-month.component';
import {DpCalendarComponent} from './dp-calendar/dp-calendar.component';
export {DpCalendarComponent} from './dp-calendar/dp-calendar.component';

@NgModule({
  declarations: [
    DpDayPickerComponent,
    DpCalendarMonthComponent,
    DpCalendarComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [DpDayPickerComponent, DpCalendarMonthComponent, DpCalendarComponent]
})

export class DpDatePickerModule {
}
