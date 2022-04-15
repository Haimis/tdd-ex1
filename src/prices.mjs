import "./polyfills.mjs";
import express from "express";

// Refactor the following code to get rid of the legacy Date class.
// Use Temporal.PlainDate instead. See /test/date_conversion.spec.mjs for examples.

function createApp(database) {
  const app = express();

  app.put("/prices", (req, res) => {
    const liftPassCost = req.query.cost;
    const liftPassType = req.query.type;
    database.setBasePrice(liftPassType, liftPassCost);
    res.json();
  });

  app.get("/prices", (req, res) => {
    const age = req.query.age;
    const type = req.query.type;
    const baseCost = database.findBasePriceByType(type).cost;
    const date = parseDate(req.query.date);
    const cost = calculateCost(age, type, date, baseCost);
    res.json({ cost });
  });

  function parseDate(dateString) {
    if (dateString) {
      return new Date(dateString);
    }
  }

  function fromDate (date) {return Temporal.PlainDate.from({ year: date.getFullYear(), month: (date.getMonth() + 1), day: date.getDate() });}

  function parseTemporalPlainDate (dateString) {return Temporal.PlainDate.from(dateString);}

  function calculateCost(age, type, date, baseCost) {
    if (type === "night") {
      return calculateCostForNightTicket(age, baseCost);
    } else {
      return calculateCostForDayTicket(age, date, baseCost);
    }
  }

  function calculateCostForNightTicket(age, baseCost) {
    if (age === undefined) {
      return 0;
    }
    if (age < 6) {
      return 0;
    }
    if (age > 64) {
      return Math.ceil(baseCost * 0.4);
    }
    return baseCost;
  }

  function calculateCostForDayTicket(age, date, baseCost) {
    let reduction = calculateReduction(date);
    if (age === undefined) {
      return Math.ceil(baseCost * (1 - reduction / 100));
    }
    if (age < 6) {
      return 0;
    }
    if (age < 15) {
      return Math.ceil(baseCost * 0.7);
    }
    if (age > 64) {
      return Math.ceil(baseCost * 0.75 * (1 - reduction / 100));
    }
    return Math.ceil(baseCost * (1 - reduction / 100));
  }

  function calculateReduction(date) {
    let reduction = 0;
    if (date && isMonday2(fromDate(date)) && !isHoliday(date)) {
      reduction = 35;
    }
    return reduction;
  }

  function isMonday(date) {
    return fromDate(date).dayOfWeek === 1;
  }

  function isMonday2 (date) {return date.dayOfWeek === 1;}

  
  function trueOrfalse (date, holiday) {if (date && date.year === holiday.year && date.month === holiday.month && date.day === holiday.day) return true}

  function isHoliday2 (date, holidays) { {for(var i = 0; i < length(holidays); i++) if (trueOrfalse(date, parseTemporalPlainDate(i))) return true } return false;}

  function isHoliday(date) {
    const date2 = parseTemporalPlainDate(date.toISOString().split('T')[0]);
    const holidays = database.getHolidays();
    console.log('jee')
    for (let row of holidays) {
      console.log(date2 in holidays)
      let holiday2 = parseTemporalPlainDate(row.holiday)
      if (
        date2 &&
        date2.year === holiday2.year &&
        date2.month === holiday2.month &&
        date2.day === holiday2.day
      ) {
        return true;
      }
    }
    return false;
  }

  return app;
}

export { createApp };
