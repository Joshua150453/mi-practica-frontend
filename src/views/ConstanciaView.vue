<template>
  <div class="login-container" v-if="!$route.params.cui">
    <div class="login-box">
      <div class="login-header">
        <h2>SISTEMA DE MATRÍCULA EPIS</h2>
        <p>Consulta de Constancia de Laboratorio</p>
      </div>
      <div class="login-body">
        <label for="cuiInput">Ingrese su C.U.I. o DNI:</label>
        <input 
          type="text" 
          id="cuiInput" 
          v-model="cuiInput" 
          placeholder="Ej: 20250100" 
          @keyup.enter="buscarConstancia"
        />
        <p v-if="validationError" class="error-text">{{ validationError }}</p>
        <button @click="buscarConstancia">Consultar Matrícula</button>
      </div>
    </div>
  </div>

  <div v-else>
    <div class="container" v-if="loading">
      <p>Cargando constancia de matrícula...</p>
    </div>

    <div class="container" v-else-if="error">
      <p class="error">{{ error }}</p>
      <button class="btn-back" @click="irAlInicio">Volver al Inicio</button>
    </div>

    <div class="certificate-box" v-else>
      <header class="header">
        <h1>CONSTANCIA DE MATRÍCULA DE LABORATORIO</h1>
        <h2>Escuela Profesional de Ingeniería de Sistemas EPIS</h2>
        <p class="date">Emitido el: 11/06/2026</p>
      </header>

      <hr class="divider" />

      <section class="section">
        <h3 class="section-title">DATOS DEL ALUMNO</h3>
        <div class="grid-datos">
          <span class="label">C.U.I.:</span>
          <span class="value">{{ estudiante.cui }}</span>

          <span class="label">Nombre completo:</span>
          <span class="value uppercase">{{ estudiante.full_name }}</span>

          <span class="label">Email:</span>
          <span class="value">{{ estudiante.email }}</span>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">ASIGNATURAS MATRICULADAS</h3>
        <table class="table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Código</th>
              <th>Curso</th>
              <th>Año</th>
              <th>Grupo</th>
              <th>Laboratorio</th>
              <th>Docente</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in matriculas" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.workload.course.code }}</td>
              <td>
                <strong>{{ item.workload.course.name }}</strong> <br>
                <span class="acronym">({{ item.workload.course.acronym }})</span>
              </td>
              <td>{{ item.workload.course.year_display }}</td>
              <td class="text-center">{{ item.workload.group }}</td>
              <td>{{ item.workload.laboratory }}</td>
              <td class="uppercase">{{ item.workload.teacher.full_name }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="summary">
        <p><strong>Total de cursos matriculados:</strong> {{ matriculas.length }}</p>
      </div>

      <div class="actions-footer">
        <button class="btn-back" @click="irAlInicio">Consultar otro Alumno</button>
      </div>

      <footer class="footer">
        <p>Documento generado digitalmente por el Sistema de Matrícula de Laboratorio EPIS.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const cuiInput = ref('')
const validationError = ref('')
const matriculas = ref([])
const estudiante = ref({})
const loading = ref(true)
const error = ref(null)

// Redirige a la ruta con el parámetro CUI
const buscarConstancia = () => {
  if (!cuiInput.value.trim()) {
    validationError.value = "Por favor, digite un número válido."
    return
  }
  validationError.value = ""
  router.push(`/constancia/${cuiInput.value.trim()}`)
}

// Te regresa al buscador principal
const irAlInicio = () => {
  cuiInput.value = ''
  router.push('/')
}

// Carga los datos de la API de manera inteligente
const cargarDatos = async (cui) => {
  if (!cui) return
  loading.value = true
  error.value = null
  try {
    // Si existe la variable de Vercel la usa; si estás en local, usa el proxy /api
    const urlBase = import.meta.env.VITE_API_URL || '/api'
    
    const response = await axios.get(`${urlBase}/restful/enrollment-certificate/?cui=${cui}`)
    
    if (response.data.results && response.data.results.length > 0) {
      matriculas.value = response.data.results
      estudiante.value = response.data.results[0].student
    } else {
      error.value = "No se encontraron registros para el CUI especificado."
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      error.value = "El CUI ingresado no está registrado en el sistema."
    } else {
      error.value = "Error al conectar con el servidor backend o problemas de red."
    }
  } finally {
    loading.value = false
  }
}

// Escucha los cambios de ruta para reaccionar inmediatamente
onMounted(() => cargarDatos(route.params.cui))
watch(() => route.params.cui, (nuevoCui) => cargarDatos(nuevoCui))
</script>

<style scoped>
/* Estilos del Formulario de Ingreso de CUI */
.login-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; font-family: Arial, sans-serif; }
.login-box { background: white; padding: 30px; border-radius: 8px; border: 1px solid #d5dbdb; box-shadow: 0 4px 10px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
.login-header h2 { color: #1a5276; font-size: 20px; margin-bottom: 5px; font-weight: bold; }
.login-header p { color: #666; font-size: 14px; margin-top: 0; margin-bottom: 25px; }
.login-body { display: flex; flex-direction: column; text-align: left; }
.login-body label { font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #333; }
.login-body input { padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; margin-bottom: 15px; outline: none; }
.login-body input:focus { border-color: #1a5276; }
.login-body button { background-color: #1a5276; color: white; padding: 12px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.login-body button:hover { background-color: #113f5c; }
.error-text { color: red; font-size: 12px; margin: -10px 0 10px 0; font-weight: bold; }

/* Estilos de la Constancia */
.container { text-align: center; padding: 40px; }
.error { color: red; font-weight: bold; margin-bottom: 20px; }
.btn-back { background-color: #7f8c8d; color: white; padding: 10px 20px; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; font-weight: bold; }
.btn-back:hover { background-color: #626567; }
.actions-footer { margin-top: 20px; text-align: left; padding-left: 10px; }
.certificate-box { max-width: 950px; margin: 20px auto; padding: 10px; font-family: Arial, sans-serif; color: #333; background: #fff; }
.header { text-align: center; }
.header h1 { color: #1a5276; font-size: 26px; font-weight: bold; margin-bottom: 5px; letter-spacing: 0.5px; }
.header h2 { color: #444; font-size: 19px; margin-top: 0; font-weight: 600; }
.date { color: #777; font-size: 13px; }
.divider { border: 0; border-top: 1px solid #bbb; margin: 20px 0; }
.section-title { background-color: #f2f4f4; padding: 10px 14px; font-size: 14px; font-weight: bold; color: #2c3e50; border-left: 5px solid #1a5276; margin-bottom: 20px; text-align: left; letter-spacing: 0.5px; }
.grid-datos { display: grid; grid-template-columns: 200px 1fr; row-gap: 12px; margin-bottom: 35px; font-size: 15px; text-align: left; padding-left: 10px; }
.label { font-weight: bold; color: #333; }
.value { color: #555; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
.table th, .table td { border: 1px solid #d5dbdb; padding: 12px 10px; text-align: left; vertical-align: middle; }
.table th { background-color: #f8f9f9; color: #34495e; font-weight: bold; }
.text-center { text-align: center; }
.uppercase { text-transform: uppercase; }
.acronym { color: #7f8c8d; font-size: 12px; font-weight: normal; }
.summary { margin-top: 25px; font-size: 15px; text-align: left; padding-left: 10px; color: #333; }
.footer { margin-top: 50px; text-align: center; font-size: 12px; font-style: italic; color: #95a5a6; }
</style>