// src/services/openaiService.js
import OpenAI from 'openai';
import config from '../config/config.js';

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey
        });
    }

    async transcribeAudio(audioBuffer) {
        try {
            const transcript = await this.openai.audio.transcriptions.create({
                file: audioBuffer,
                model: "whisper-1",
                language: "es",
                response_format: "text"
            });

            // Estructurar el texto transcrito
            const structuredContent = await this.structureTranscription(transcript);
            
            return structuredContent;
        } catch (error) {
            throw new Error(`Transcription error: ${error.message}`);
        }
    }

    async structureTranscription(transcript) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Eres un asistente educativo experto en estructurar contenido de clases.
                        Debes organizar la transcripción en las siguientes secciones:
                        1. Resumen de la clase
                        2. Temas principales
                        3. Conceptos clave
                        4. Ejemplos mencionados
                        5. Conclusiones
                        
                        El formato debe ser claro y fácil de leer para los estudiantes.`
                    },
                    {
                        role: "user",
                        content: transcript
                    }
                ]
            });

            return completion.choices[0].message.content;
        } catch (error) {
            throw new Error(`Structuring error: ${error.message}`);
        }
    }

    async generateTasks(structuredContent) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Eres un profesor experto en crear actividades educativas.
                        Basándote en el contenido proporcionado, genera 3 actividades diferentes que incluyan:
                        1. Título de la actividad
                        2. Objetivo de aprendizaje
                        3. Instrucciones claras
                        4. Criterios de evaluación
                        5. Tiempo estimado de realización
                        
                        Las actividades deben ser prácticas y enfocadas en reforzar los conceptos principales.`
                    },
                    {
                        role: "user",
                        content: structuredContent
                    }
                ]
            });

            return completion.choices[0].message.content;
        } catch (error) {
            throw new Error(`Task generation error: ${error.message}`);
        }
    }

    async generateQuiz(structuredContent) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Eres un experto en evaluación educativa.
                        Genera un cuestionario que incluya:
                        1. 5 preguntas de opción múltiple
                        2. 3 preguntas de verdadero/falso
                        3. 2 preguntas de desarrollo corto
                        
                        Cada pregunta debe:
                        - Estar claramente formulada
                        - Incluir las respuestas correctas (marcadas)
                        - Tener una breve explicación de la respuesta
                        
                        Formato JSON para fácil procesamiento.`
                    },
                    {
                        role: "user",
                        content: structuredContent
                    }
                ]
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            throw new Error(`Quiz generation error: ${error.message}`);
        }
    }
}

export default new OpenAIService();