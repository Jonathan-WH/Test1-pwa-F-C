import { Injectable } from '@angular/core';
import { interval, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  public readonly clock$: Observable<{ name: string; digitalTime: string; hourAngle: number; minuteAngle: number; secondAngle: number }[]>;

  constructor() {
    this.clock$ = interval(1000).pipe(
      map(() => {
        const now = new Date();
        return [
          this.createClock("Genève", "Europe/Zurich", now),
          this.createClock("New York", "America/New_York", now),
          this.createClock("Tokyo", "Asia/Tokyo", now),
        ];
      })
    );
  }

  private createClock(city: string, timeZone: string, now: Date) {
    const localTime = new Date(now.toLocaleString("en-US", { timeZone }));
    const hours = localTime.getHours() % 12;
    const minutes = localTime.getMinutes();
    const seconds = localTime.getSeconds();

    return {
      name: city,
      digitalTime: localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // ✅ Ajouté ici
      hourAngle: (360 / 12) * hours + (30 / 60) * minutes,
      minuteAngle: (360 / 60) * minutes + (6 / 60) * seconds,
      secondAngle: (360 / 60) * seconds
    };
  }
}