import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Define interfaces for type safety
interface SpecialtyCount {
  [specialty: string]: number;
}

interface DailyCount {
  [date: string]: number;
}

interface DoctorCount {
  [doctor: string]: number;
}

@Component({
  selector: 'app-admin-statistics',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-statistics.component.html',
  styleUrls: ['./admin-statistics.component.css'],
  standalone: true,
})
export class AdminStatisticsComponent implements OnInit {
  specialtyAppointmentsChart!: Chart;
  dailyAppointmentsChart!: Chart;
  doctorAppointmentsChart!: Chart;
  startDate: string | null = null;
  endDate: string | null = null;
  requestedAppointmentsChart: Chart | null = null;
  completedAppointmentsChart: Chart | null = null;

  constructor(private firestore: Firestore) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadSpecialtyAppointments();
    this.loadDailyAppointments();
    this.loadDoctorAppointments();
    this.loadLoginLogs();
  }

  async loadSpecialtyAppointments() {
    try {
      const appointmentsRef = collection(this.firestore, 'turnos');
      const querySnapshot = await getDocs(appointmentsRef);

      // Group appointments by specialty
      const specialtyCount: SpecialtyCount = {};
      querySnapshot.forEach((doc) => {
        const specialty = doc.data()['especialidad'] as string;
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
      });

      // Create chart configuration with explicit types
      const config: ChartConfiguration = {
        type: 'pie',
        data: {
          labels: Object.keys(specialtyCount),
          datasets: [
            {
              data: Object.values(specialtyCount),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Turnos por Especialidad',
            },
          },
        },
      };

      // Create chart
      this.specialtyAppointmentsChart = new Chart('specialtyChart', config);
    } catch (error) {
      console.error('Error loading specialty appointments:', error);
    }
  }

  async loadDailyAppointments() {
    try {
      const appointmentsRef = collection(this.firestore, 'turnos');
      const querySnapshot = await getDocs(appointmentsRef);

      const dailyCount: DailyCount = {};
      querySnapshot.forEach((doc) => {
        const timestamp = doc.data()['fecha'];
        if (timestamp && typeof timestamp.toDate === 'function') {
          const date = timestamp.toDate().toLocaleDateString();
          dailyCount[date] = (dailyCount[date] || 0) + 1;
        }
      });

      const sortedDates = Object.keys(dailyCount)
        .map((date) => new Date(date))
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => date.toLocaleDateString());

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: sortedDates,
          datasets: [
            {
              label: 'Turnos por Día',
              data: sortedDates.map((date) => dailyCount[date]),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };

      // Create chart
      this.dailyAppointmentsChart = new Chart('dailyChart', config);
    } catch (error) {
      console.error('Error loading daily appointments:', error);
    }
  }

  async loadLoginLogs() {
    try {
      const logsRef = collection(this.firestore, 'logs');
      const querySnapshot = await getDocs(logsRef);

      const dailyLogins: { [date: string]: number } = {};
      querySnapshot.forEach((doc) => {
        const timestamp = doc.data()['fechaIngreso'];
        if (timestamp && typeof timestamp.toDate === 'function') {
          const fechaIngreso = timestamp.toDate().toLocaleDateString();
          dailyLogins[fechaIngreso] = (dailyLogins[fechaIngreso] || 0) + 1;
        }
      });

      const sortedDates = Object.keys(dailyLogins)
        .map((date) => new Date(date))
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => date.toLocaleDateString());

      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: sortedDates,
          datasets: [
            {
              label: 'Ingresos por Día',
              data: sortedDates.map((date) => dailyLogins[date]),
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Log de Ingresos al Sistema',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Fecha',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Ingresos',
              },
            },
          },
        },
      };

      new Chart('loginLogsChart', config);
    } catch (error) {
      console.error('Error loading login logs:', error);
    }
  }

  async loadDoctorAppointments(startDate?: Timestamp, endDate?: Timestamp) {
    try {
      const appointmentsRef = collection(this.firestore, 'turnos');
      let q = query(appointmentsRef);

      if (startDate && endDate) {
        q = query(
          appointmentsRef,
          where('fecha', '>=', startDate),
          where('fecha', '<=', endDate)
        );
      }

      const querySnapshot = await getDocs(q);

      const requestedCount: Record<string, number> = {};
      const completedCount: Record<string, number> = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Documento recuperado:', data);
        const doctor = data['especialista'] as string;
        const status = data['estado'] as string;

        console.log('estado => ', status);

        if (status === 'solicitado') {
          requestedCount[doctor] = (requestedCount[doctor] || 0) + 1;
        } else if (status === 'realizado') {
          completedCount[doctor] = (completedCount[doctor] || 0) + 1;
        }
      });

      // Configuración y renderización de gráficos
      this.updateChart(
        'requestedChart',
        requestedCount,
        'Turnos Solicitados por Médico',
        'rgba(75, 192, 192, 0.6)'
      );
      this.updateChart(
        'completedChart',
        completedCount,
        'Turnos Finalizados por Médico',
        'rgba(153, 102, 255, 0.6)'
      );
    } catch (error) {
      console.error('Error loading doctor appointments:', error);
    }
  }

  updateChart(
    chartId: string,
    data: Record<string, number>,
    label: string,
    color: string
  ) {
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: label,
            data: Object.values(data),
            backgroundColor: color,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    // Destruir el gráfico anterior si existe para evitar duplicados
    if (chartId === 'requestedChart' && this.requestedAppointmentsChart) {
      this.requestedAppointmentsChart.destroy();
    } else if (
      chartId === 'completedChart' &&
      this.completedAppointmentsChart
    ) {
      this.completedAppointmentsChart.destroy();
    }

    // Crear un nuevo gráfico
    if (chartId === 'requestedChart') {
      this.requestedAppointmentsChart = new Chart(chartId, config);
    } else if (chartId === 'completedChart') {
      this.completedAppointmentsChart = new Chart(chartId, config);
    }
  }

  applyDateFilter() {
    if (this.startDate && this.endDate) {
      const start = Timestamp.fromDate(new Date(this.startDate));
      const end = Timestamp.fromDate(new Date(this.endDate));

      console.log('Fechas convertidas:', start, end);

      this.loadDoctorAppointments(start, end);
    } else {
      console.warn('Por favor, selecciona un rango de fechas válido.');
    }
  }
}
