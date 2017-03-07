import {ICalendarDay} from '../dp-calendar/config/day.model';
import {Component, forwardRef, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DpCalendarComponent} from '../dp-calendar/dp-calendar.component';
import * as moment from 'moment';
import {Moment} from 'moment';
import {DayPickerService} from './service/day-picker.service';
import {IDayPickerConfig} from './service/day-picker-config.model';
import {ICalendarConfig} from '../dp-calendar/config/calendar-config.model';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {UtilsService} from '../common/services/utils/utils.service';
import {IObDayPickerApi} from './dp-day-picker.api';

export type CalendarValue = string | string[] | Moment | Moment[];

@Component({
  selector: 'dp-day-picker',
  templateUrl: './dp-day-picker.component.html',
  styleUrls: ['./dp-day-picker.component.less'],
  entryComponents: [DpCalendarComponent],
  providers: [
    DayPickerService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DpDayPickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DpDayPickerComponent),
      multi: true
    }
  ]
})
export class DpDayPickerComponent implements OnChanges, OnInit, ControlValueAccessor, Validator {
  private shouldNgInit: boolean = true;
  @Input('config') private userConfig: IDayPickerConfig;

  // attributes
  @Input() private placeholder: string = '';
  @Input() private disabled: boolean = false;

  // validations
  @Input() private minDate: Moment | string;
  @Input() private maxDate: Moment | string;

  private areCalendarsShown: boolean = false;
  private hideStateHelper: boolean = false;
  private pickerConfig: IDayPickerConfig;
  private calendars: ICalendarConfig[];
  private _value: Moment[] = [];
  private userValue;
  private viewValue: string;
  validateFn: Function;

  private get value(): Moment[] {
    return this._value;
  }

  private set value(value: Moment[]) {
    this._value = value;
    this.viewValue = this._value ? this._value.map(val => val.format(this.pickerConfig.format)).join(', ') : '';
    if (this._value && this._value.length > 0) {
      this.calendars = this.dayPickerService.moveCalendars(this.pickerConfig, this._value, this._value[0], 0);
    }
    this.onChangeCallback(this.processOnChangeCallback(value));
  }

  api: IObDayPickerApi = <IObDayPickerApi>{};

  constructor(private dayPickerService: DayPickerService) {
  }

  @HostListener('click')
  onClick() {
    this.hideStateHelper = true;
  }

  @HostListener('document:click')
  onBodyClick() {
    if (!this.hideStateHelper) {
      this.hideCalendars();
    }
    this.hideStateHelper = false;
  }

  ngOnInit() {
    if (this.shouldNgInit) {
      this.init();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.shouldNgInit = false;
    const {minDate, maxDate} = changes;
    this.init();

    if (minDate || maxDate) {
      this.initValidators();
    }
  }

  writeValue(value: Moment): void {
    if (value) {
      this.pickerConfig.userValueType = this.pickerConfig.userValueType || (typeof value === 'string' ? 'string' : 'object');
      this.userValue = value;
      this.init();
    }
  }

  processOnChangeCallback(value: Moment[]): CalendarValue {
    if (!value || value.length === 0) {
      return null;
    }
    if (value.length > 0 && !this.pickerConfig.allowMultiSelect) {
      return this.pickerConfig.userValueType === 'string' ? this.viewValue : value[0];
    }
    return this.pickerConfig.userValueType === 'string' ? this.viewValue.split(', ') : value;
  }

  onChangeCallback(_: any) {
  };

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  validate(c: FormControl) {
    if (this.minDate || this.maxDate) {
      return this.validateFn(c);
    } else {
      return () => null;
    }
  }

  isDateValid(value: string) {
    if (this.dayPickerService.isDateValid(value, this.pickerConfig.format)) {
      this.value = this.value.concat(moment(value, this.pickerConfig.format));
    }
  }

  // start
  init() {
    this.pickerConfig = this.dayPickerService.getConfig(this.userConfig);
    if (this.userValue) {
      if (Array.isArray(this.userValue)) {
        if (this.userConfig.allowMultiSelect === undefined) {
          // set allowMultiSelect to true unless explicitly set by user
          this.pickerConfig.allowMultiSelect = true;
        }
        if (this.pickerConfig.allowMultiSelect) {
          this.value = this.userValue.map(val => UtilsService.convertToMoment(val, this.pickerConfig.format));
        } else {
          this.value = [UtilsService.convertToMoment(this.userValue[0], this.pickerConfig.format)];
        }
      } else if (typeof this.userValue === 'string') {
        if (this.userConfig.userValueType === undefined) {
          // set userValueType to 'string' unless explicitly set by user
          this.pickerConfig.userValueType = 'string';
        }
        if (this.userValue.includes(',') && this.userConfig.allowMultiSelect === undefined) {
          // set allowMultiSelect to true unless explicitly set by user
          this.pickerConfig.allowMultiSelect = true;
        }
        if (this.pickerConfig.allowMultiSelect) {
          this.value = this.userValue.split(',').map(val => UtilsService.convertToMoment(val.trim(), this.pickerConfig.format));
        } else {
          this.value = [UtilsService.convertToMoment(this.userValue, this.pickerConfig.format)];
        }
      } else {
        this.value = [UtilsService.convertToMoment(this.userValue, this.pickerConfig.format)];
      }
    }
    this.calendars = this.dayPickerService.generateCalendars(this.pickerConfig, this.value);
    this.initApi();
  }

  initValidators() {
    this.validateFn = this.dayPickerService.createValidator({
      minDate: typeof this.minDate === 'string' ?
        moment(<string>this.minDate, this.pickerConfig.format) : <Moment>this.minDate,
      maxDate: typeof this.maxDate === 'string' ?
        moment(<string>this.maxDate, this.pickerConfig.format) : <Moment>this.maxDate
    }, this.pickerConfig.format);
    this.onChangeCallback(this.processOnChangeCallback(this.value));
  }

  initApi() {
    this.api = {
      open: this.showCalendars.bind(this),
      close: this.hideCalendars.bind(this)
    };
  }

  daySelected({day}: { day: ICalendarDay}) {
    if (!this.pickerConfig.allowMultiSelect) {
      // Single selection
      this.value = [day.date];
    } else if (day.selected && this.value) {
      // Unselecting a day
      this.value = this.value.filter(val => !val.isSame(day.date, 'day'));
    } else if (this.pickerConfig.allowMultiSelect) {
      // Multi selection
      this.value = this.value ? this.value.concat(day.date) : [day.date];
    }

    if (this.pickerConfig.closeOnSelect) {
      setTimeout(this.hideCalendars, this.pickerConfig.closeOnSelectDelay);
    }
  }

  inputFocused() {
    this.hideStateHelper = false;
    this.areCalendarsShown = true;
  }

  getMonthToDisplay(month: Moment): string {
    if (typeof this.pickerConfig.monthFormatter === 'function') {
      return this.pickerConfig.monthFormatter(month);
    }

    return month.format(this.pickerConfig.monthFormat);
  }

  showCalendars = () => {
    this.hideStateHelper = true;
    this.areCalendarsShown = true;
  };

  hideCalendars = () => {
    this.areCalendarsShown = false;
  };

  moveCalendars(base: Moment, months: number) {
    this.calendars = this.dayPickerService.moveCalendars(this.pickerConfig, this.value, base, months);
  }

  isLeftNavDisabled(month: Moment): boolean {
    return this.dayPickerService.isMinMonth(<Moment>this.pickerConfig.min, month);
  }

  isRightNavDisabled(month: Moment): boolean {
    return this.dayPickerService.isMaxMonth(<Moment>this.pickerConfig.max, month);
  }

  onViewDateChange(dates: string) {
    const dateStrings = dates.split(',').map(date => date.trim());
    const validDateStrings = dateStrings.filter(date => this.dayPickerService.isDateValid(date, this.pickerConfig.format));
    if (!this.pickerConfig.allowMultiSelect && validDateStrings.length > 0) {
      // Single selection
      this.value = validDateStrings[0] !== '' ? [moment(validDateStrings[0], this.pickerConfig.format)] : [];
    } else if (validDateStrings.length === dateStrings.length && this.pickerConfig.allowMultiSelect) {
      // Multi selection
      this.value = validDateStrings
        .map(date => date !== '' ? moment(date, this.pickerConfig.format) : null)
        .filter(date => date !== null);
    }
  }

  onKeydown(e: KeyboardEvent) {
    if (e.keyCode === 13) {
      this.areCalendarsShown = !this.areCalendarsShown;
      e.preventDefault();
    }

    if (e.keyCode === 27) {
      this.areCalendarsShown = false;
      e.preventDefault();
    }

    if (this.pickerConfig.disableKeypress) {
      e.preventDefault();
    }
  }
}
