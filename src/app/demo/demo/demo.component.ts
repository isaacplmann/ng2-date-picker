import debounce from '../../common/decorators/decorators';
import {IDatePickerConfig} from '../../date-picker/date-picker-config.model';
import {DatePickerComponent} from '../../date-picker/date-picker.component';
import {DatePickerDirective} from '../../date-picker/date-picker.directive';
import {Component, HostListener, ViewChild} from '@angular/core';
import { FormControl, NgForm, FormGroup, Validators, Validator, AbstractControl } from '@angular/forms';
import {Moment} from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'dp-demo',
  templateUrl: './demo.component.html',
  entryComponents: [DatePickerComponent],
  styleUrls: ['./demo.component.less']
})
export class DemoComponent {
  @ViewChild('datePicker') datePicker: DatePickerComponent;
  @ViewChild('dateDirectivePicker') dateDirectivePicker: DatePickerDirective;
  demoFormat = 'DD-MM-YYYY';
  readonly DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  pickerMode = 'dayPicker';

  date: Moment;
  dates: Moment[] = [];
  material: boolean = true;
  required: boolean = false;
  disabled: boolean = false;
  validationMinDate: Moment;
  validationMaxDate: Moment;
  placeholder: string = 'Choose a date...';

  formGroup: FormGroup = new FormGroup({
    datePicker: new FormControl(this.date, [
      this.required ? Validators.required : () => undefined,
      control => this.validationMinDate && this.config && moment(control.value, this.config.format).isBefore(this.validationMinDate)
        ? {minDate: 'minDate Invalid'} : undefined,
      control => this.validationMaxDate && this.config && moment(control.value, this.config.format).isAfter(this.validationMaxDate)
        ? {maxDate: 'maxDate Invalid'} : undefined,
    ]),
  });

  config: IDatePickerConfig = {
    firstDayOfWeek: 'su',
    format: 'DD-MM-YYYY',
    monthFormat: 'MMM, YYYY',
    disableKeypress: false,
    allowMultiSelect: false,
    closeOnSelect: undefined,
    closeOnSelectDelay: 100,
    onOpenDelay: 0,
    weekdayNames: {
      su: 'sun',
      mo: 'mon',
      tu: 'tue',
      we: 'wed',
      th: 'thu',
      fr: 'fri',
      sa: 'sat'
    },
    appendTo: document.body,
    drops: 'down',
    opens: 'right',
    showNearMonthDays: true,
    showWeekNumbers: false,
    enableMonthSelector: true,
    yearFormat: 'YYYY',
    showGoToCurrent: true,
    dayBtnFormat: 'DD',
    monthBtnFormat: 'MMM'
  };
  isAtTop: boolean = true;

  @HostListener('document:scroll')
  @debounce(100)
  updateIsAtTop() {
    this.isAtTop = document.body.scrollTop === 0;
  }

  modeChanged() {
    this.config.hideInputContainer = false;
    this.config.inputElementContainer = undefined;
  }

  validatorsChanged() {
    this.formGroup.get('datePicker').updateValueAndValidity();
  }

  configChanged() {
    this.config = {...this.config};
  };

  createCustomWeekDays() {
    this.config.weekdayNames = this.config.weekdayNames || {};
  }

  openCalendar() {
    (this.datePicker || this.dateDirectivePicker).api.open();
  }

  closeCalendar() {
    (this.datePicker || this.dateDirectivePicker).api.close();
  }

  log(item) {
    console.log(item);
  }
}
