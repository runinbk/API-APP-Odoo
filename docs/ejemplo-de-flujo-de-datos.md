# Ejemplo de Implementación del Sistema Escolar

## 1. Configuración de Gestión
```python
gestion_2024 = {
    'nombre': 'Gestión 2024',
    'fecha_inicio': '2024-02-01',
    'fecha_fin': '2024-11-30'
}
```

## 2. Configuración de Cursos
```python
cursos = [
    {
        'nombre': 'Primero',
        'nivel': 'Secundaria A'
    },
    {
        'nombre': 'Primero',
        'nivel': 'Secundaria B'
    },
    {
        'nombre': 'Segundo',
        'nivel': 'Secundaria A'
    }
]
```

## 3. Configuración de Materias
```python
materias = [
    {
        'nombre': 'Matemáticas',
        'descripcion': 'Matemáticas básica y álgebra'
    },
    {
        'nombre': 'Literatura',
        'descripcion': 'Comprensión lectora y producción de textos'
    },
    {
        'nombre': 'Física',
        'descripcion': 'Física básica y mecánica'
    }
]
```

## 4. Configuración de Profesores
```python
profesores = [
    {
        'user_id': 'carlos.rodriguez@colegio.com',  # Usuario ya creado en el sistema
        'especialidad': 'Matemáticas y Física',
    },
    {
        'user_id': 'ana.lopez@colegio.com',  # Usuario ya creado en el sistema
        'especialidad': 'Literatura y Lenguaje',
    },
    {
        'user_id': 'mario.santos@colegio.com',  # Usuario ya creado en el sistema
        'especialidad': 'Matemáticas',
    }
]
```

## 5. Configuración de Tutores
```python
tutores = [
    {
        'user_id': 'roberto.martinez@mail.com',  # Usuario ya creado en el sistema
        'parentesco': 'Padre',
    },
    {
        'user_id': 'maria.garcia@mail.com',  # Usuario ya creado en el sistema
        'parentesco': 'Madre',
    },
    {
        'user_id': 'julia.paz@mail.com',  # Usuario ya creado en el sistema
        'parentesco': 'Madre',
    }
]
```

## 6. Configuración de Alumnos
```python
alumnos = [
    {
        'user_id': 'pedro.martinez@colegio.com',  # Usuario ya creado en el sistema
        'edad': 12,
        'tutor_id': 'roberto.martinez@mail.com',  # Referencia al tutor 1
        'grado': 'Primero - Secundaria A'
    },
    {
        'user_id': 'ana.martinez@colegio.com',  # Usuario ya creado en el sistema
        'edad': 12,
        'tutor_id': 'roberto.martinez@mail.com',  # Referencia al tutor 1
        'grado': 'Primero - Secundaria B'
    },
    {
        'user_id': 'juan.garcia@colegio.com',  # Usuario ya creado en el sistema
        'edad': 13,
        'tutor_id': 'maria.garcia@mail.com',  # Referencia al tutor 2
        'grado': 'Segundo - Secundaria A'
    },
    {
        'user_id': 'carla.paz@colegio.com',  # Usuario ya creado en el sistema
        'edad': 12,
        'tutor_id': 'julia.paz@mail.com',  # Referencia al tutor 3
        'grado': 'Primero - Secundaria A'
    }
]
```

## 7. Asignaciones
```python
asignaciones = [
    # Primer curso
    {
        'curso_id': 'Primero - Secundaria A',
        'materia_id': 'Matemáticas',
        'profesor_id': 'carlos.rodriguez@colegio.com',
        'gestion_id': 'Gestión 2024'
    },
    {
        'curso_id': 'Primero - Secundaria A',
        'materia_id': 'Literatura',
        'profesor_id': 'ana.lopez@colegio.com',
        'gestion_id': 'Gestión 2024'
    },
    # Segundo curso
    {
        'curso_id': 'Primero - Secundaria B',
        'materia_id': 'Matemáticas',
        'profesor_id': 'mario.santos@colegio.com',
        'gestion_id': 'Gestión 2024'
    },
    {
        'curso_id': 'Segundo - Secundaria A',
        'materia_id': 'Física',
        'profesor_id': 'carlos.rodriguez@colegio.com',
        'gestion_id': 'Gestión 2024'
    }
]
```

## Resumen de Relaciones

### Familia Martínez
- Roberto Martínez (Tutor)
  - Pedro Martínez (Alumno en 1ro Secundaria A)
  - Ana Martínez (Alumna en 1ro Secundaria B)

### Familia García
- María García (Tutora)
  - Juan García (Alumno en 2do Secundaria A)

### Familia Paz
- Julia Paz (Tutora)
  - Carla Paz (Alumna en 1ro Secundaria A)

### Distribución de Profesores
1. Carlos Rodríguez
   - Matemáticas (1ro Secundaria A)
   - Física (2do Secundaria A)
2. Ana López
   - Literatura (1ro Secundaria A)
3. Mario Santos
   - Matemáticas (1ro Secundaria B)

### Cursos y sus Alumnos
1. Primero Secundaria A
   - Pedro Martínez
   - Carla Paz
2. Primero Secundaria B
   - Ana Martínez
3. Segundo Secundaria A
   - Juan García