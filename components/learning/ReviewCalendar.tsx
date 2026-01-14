"use client";

import { useState, useMemo } from "react";
import { VocabSet, LearningProgress } from "@/types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ReviewCalendarProps {
  sets: Array<{
    set: VocabSet;
    progress: LearningProgress[];
    nextReviewDate: string | null;
  }>;
}

interface DayReview {
  date: Date;
  sets: Array<{
    setId: string;
    setName: string;
    wordCount: number;
  }>;
  totalSets: number;
}

export function ReviewCalendar({ sets }: ReviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayReview | null>(null);

  // Calculate review schedule (set-based)
  const reviewSchedule = useMemo(() => {
    const schedule = new Map<string, DayReview>();

    sets.forEach(({ set, nextReviewDate }) => {
      if (!nextReviewDate) return;

      const reviewDate = new Date(nextReviewDate);
      const dateKey = reviewDate.toISOString().split("T")[0];

      if (!schedule.has(dateKey)) {
        schedule.set(dateKey, {
          date: reviewDate,
          sets: [],
          totalSets: 0,
        });
      }

      const dayReview = schedule.get(dateKey)!;

      // Get word count for this set
      const wordCount = (set as any).wordCount || 0;

      dayReview.sets.push({
        setId: set.id,
        setName: set.name,
        wordCount: wordCount,
      });

      dayReview.totalSets++;
    });

    return schedule;
  }, [sets]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      date: Date | null;
      dayNumber: number | null;
      isCurrentMonth: boolean;
      review: DayReview | null;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    // Fill in days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: null,
        dayNumber: null,
        isCurrentMonth: false,
        review: null,
        isToday: false,
        isPast: false,
      });
    }

    // Fill in days of current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split("T")[0];
      const review = reviewSchedule.get(dateKey) || null;
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;

      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        review,
        isToday,
        isPast,
      });
    }

    return days;
  }, [currentDate, reviewSchedule]);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
    setSelectedDay(null);
  };

  const handleDayClick = (day: typeof calendarDays[0]) => {
    if (day.review) {
      setSelectedDay(day.review);
    } else {
      setSelectedDay(null);
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDaysShort = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Review Schedule</h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <div className="min-w-[120px] sm:min-w-[160px] text-center font-semibold text-sm sm:text-base text-gray-900">
            {monthName}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
        {/* Week day headers */}
        {weekDays.map((day, index) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 py-1 sm:py-2"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{weekDaysShort[index]}</span>
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (!day.isCurrentMonth) {
            return (
              <div
                key={index}
                className="aspect-square p-2 bg-gray-50 rounded-lg"
              />
            );
          }

          const hasReview = day.review !== null;
          const setCount = day.review?.totalSets || 0;

          // Color coding based on set count
          let reviewColor = "";
          if (setCount === 0) {
            reviewColor = "";
          } else if (setCount === 1) {
            reviewColor = "bg-green-100 border-green-300 text-green-900";
          } else if (setCount === 2) {
            reviewColor = "bg-yellow-100 border-yellow-300 text-yellow-900";
          } else if (setCount <= 4) {
            reviewColor = "bg-orange-100 border-orange-300 text-orange-900";
          } else {
            reviewColor = "bg-red-100 border-red-300 text-red-900";
          }

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={`aspect-square p-1 sm:p-2 rounded-md sm:rounded-lg border border-2 transition-all relative ${
                day.isToday
                  ? "border-blue-500 bg-blue-50"
                  : hasReview
                  ? `${reviewColor} hover:shadow-md cursor-pointer`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              } ${day.isPast && !hasReview ? "opacity-50" : ""}`}
            >
              <div className="text-xs sm:text-sm font-semibold">{day.dayNumber}</div>
              {hasReview && (
                <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2">
                  <div className="text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 bg-white rounded-full shadow-sm">
                    <span className="hidden xs:inline">{setCount} {setCount === 1 ? "set" : "sets"}</span>
                    <span className="xs:hidden">{setCount}</span>
                  </div>
                </div>
              )}
              {day.isToday && (
                <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span>1 set</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
          <span>2 sets</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
          <span>3-4 sets</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span>5+ sets</span>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              {selectedDay.date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <span className="text-xs sm:text-sm font-medium text-gray-600">
              {selectedDay.totalSets} {selectedDay.totalSets === 1 ? "set" : "sets"} to review
            </span>
          </div>

          <div className="space-y-2">
            {selectedDay.sets.map((setInfo) => (
              <Link
                key={setInfo.setId}
                href={`/dashboard/learn/${setInfo.setId}/learn`}
                className="block"
              >
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium text-gray-900">
                        {setInfo.setName}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 ml-5 sm:ml-0">
                      {setInfo.wordCount} {setInfo.wordCount === 1 ? "word" : "words"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedDay && (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm px-4">
          Click on a highlighted date to see which sets need review
        </div>
      )}
    </div>
  );
}
