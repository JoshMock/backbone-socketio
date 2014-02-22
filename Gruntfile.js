'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        mochaTest: {
            test: {
                src: ['test/**/*_test.js']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js']
            },
            client: {
                jshintrc: 'client/.jshintrc',
                src: ['client/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'mochaTest:test']
            },
            client: {
                files: '<%= jshint.client.src %>',
                tasks: ['jshint:client', 'mochaTest:test']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'mochaTest:test']
            },
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', ['jshint', 'mochaTest:test']);
};
