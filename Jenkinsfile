pipeline {
    agent any
    
    environment {
        // Define any environment variables if needed
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls the latest code from the Git repository
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing backend dependencies...'
                    dir('backend') {
                        bat 'npm install'
                    }
                    echo 'Installing frontend dependencies...'
                    dir('frontend') {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building the frontend application...'
                    dir('frontend') {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo 'Running backend unit tests...'
                    dir('backend') {
                        // Assuming there are tests in the backend
                        // If no tests are configured yet, this might fail or be skipped
                        bat 'npm test -- --passWithNoTests'
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Build Process Completed.'
        }
        success {
            echo 'Build and Tests Passed!'
        }
        failure {
            echo 'Build or Tests Failed. Please check the logs.'
        }
    }
}
