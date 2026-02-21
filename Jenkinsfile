pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    dir('backend') { bat 'npm install' }
                    dir('frontend') { bat 'npm install' }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    dir('frontend') { bat 'npm run build' }
                }
            }
        }

        stage('Test Frontend') {
            steps {
                script {
                    dir('frontend') { bat 'npm test -- --passWithNoTests' }
                }
            }
        }
    }
}