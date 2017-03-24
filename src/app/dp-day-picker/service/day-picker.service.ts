import {Injectable} from '@angular/core';
import {IDayPickerConfig} from './day-picker-config.model';
import * as moment from 'moment';
import {UtilsService} from '../../common/services/utils/utils.service';
import {ICalendarConfig} from '../../dp-calendar/config/calendar-config.model';
import {Moment} from 'moment';
import {FormControl} from '@angular/forms';

@Injectable()
export class DayPickerService {
  private defaultConfig: IDayPickerConfig = {
    closeOnSelect: true,
    closeOnSelectDelay: 100,
    disableKeypress: false
  };

  constructor(private calendarContainerService: CalendarService) {}

  getConfig(config: IDayPickerConfig): ICalendarConfig {
    if (config && config.allowMultiSelect && config.closeOnSelect === undefined) {
      // Default to not closing if multi select enabled
      config.closeOnSelect = false;
    }
    const _config = Object.assign({}, this.defaultConfig, config);
    this.formatValues(_config);
    return _config;
  }

  generateCalendars(config: IDayPickerConfig, selected: Moment[], month?: Moment): ICalendarConfig[] {
    const base = (month && month.clone()) || (selected && selected[0] && selected[0].clone()) || moment();
    return UtilsService.createArray(config.calendarsAmount).map((n: number, i: number) => ({
      month: base.clone().add(i, 'month'),
      selected: selected,
      firstDayOfWeek: config.firstDayOfWeek,
      weekdayNames: config.weekdayNames,
      min: <Moment>config.min,
      max: <Moment>config.max
    }));
  }

  isDateValid(date: string, format: string): boolean {
    if (date === '') {
      return true;
    }
    return moment(date, format, true).isValid();
  }

  moveCalendars(config: IDayPickerConfig, selected: Moment[], base: Moment, months: number): ICalendarConfig[] {
    const month = base.clone().add(months, 'month');
    return this.generateCalendars(config, selected, month);
  }

  isMinMonth(min: Moment, month): boolean {
    return min ? month.clone().subtract(1, 'month').isBefore(min, 'month') : false;
  }

  isMaxMonth(max: Moment, month): boolean {
    return max ? month.clone().add(1, 'month').isAfter(max, 'month') : false;
  }

  createValidator({minDate, maxDate}, dateFormat: string) {
    let isValid: boolean;
    let value: Moment[];
    const validators = [];

    if (minDate) {
      validators.push({
        key: 'minDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrAfter(minDate, 'day'));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    if (maxDate) {
      validators.push({
        key: 'maxDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrBefore(maxDate, 'day'));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    return function validateInput(c: FormControl) {
      isValid = true;

      if (c.value) {
        if (typeof c.value === 'string') {
          const dateStrings = c.value.split(',').map(date => date.trim());
          const validDateStrings = dateStrings.filter(date => this.dayPickerService.isDateValid(date, this.pickerConfig.format));
          value = validDateStrings.map(dateString => moment(dateString, dateFormat));
        } else if (!Array.isArray(c.value)) {
          value = [c.value];
        } else {
          value = c.value.map(val => UtilsService.convertToMoment(val, dateFormat));
        }
      } else {
        return null;
      }

      if (!value.every(val => val.isValid())) {
        return {
          format: {
            given: c.value
          }
        };
      }

      const errors = validators.reduce((map, err) => {
        if (!err.isValid()) {
          map[err.key] = {
            given: value
          };
        }

        return map;
      }, <any>{});

      return !isValid ? errors : null;
    };
  }
}
