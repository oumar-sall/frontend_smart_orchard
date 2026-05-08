pipeline {
    agent any

    tools {
        nodejs 'node25'
    }

    stages {
        stage('Installation') {
            steps {
                echo 'Installing frontend dependencies...'
                bat 'npm install'
            }
        }

        stage('Quality Check (Lint)') {
            steps {
                echo 'Running linting...'
                bat 'npm run lint'
            }
        }

        stage('Validation du Build') {
            steps {
                echo 'Verifying that the project is exportable...'
                // npx expo export vérifie que le projet peut être compilé pour le web/statique
                // sans nécessiter d'outils Android/iOS lourds sur le serveur Jenkins.
                bat 'npx expo export'
            }
        }
    }

    post {
        success {
            echo 'Frontend is clean and buildable! Ready for manual build/EAS.'
        }
        failure {
            echo 'Frontend quality check failed. Please check linting or build errors.'
        }
    }
}
