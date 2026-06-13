USE fitness_app;

ALTER TABLE usuarios ADD COLUMN nivel_experiencia ENUM('Principiante', 'Intermedio', 'Avanzado') DEFAULT 'Principiante';
ALTER TABLE usuarios ADD COLUMN peso_actual DECIMAL(5,2);
ALTER TABLE usuarios ADD COLUMN estatura_cm INT;
ALTER TABLE usuarios ADD COLUMN onboarding_completado BOOLEAN DEFAULT FALSE;
