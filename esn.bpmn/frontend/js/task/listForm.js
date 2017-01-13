'use strict';

angular.module('esn.bpmn')
  .controller('formController', function($scope, bpmnService) {

    $scope.isShow = false;
    $scope.hasTask = false;

    $scope.activitiName = 'Task form';
    $scope.activitiFields = {};

    $scope.bpmnFormDataList = bpmnService.listActiveTaskForm().then(function(result) {
      if (result.data.length === 0) {
        $scope.hasTask = false;
      }else {
        $scope.hasTask = true;
      }
      $scope.bpmnFormDataList = result.data;
      return result.data;
    }, function(err) {
      alert(err);
    });

    $scope.selectTaskInformation = function(data) {
      return data[data.length - 1].templateOptions.placeholder;
    };

    $scope.selectForm = function(data) {
      $scope.activitiFields = data.form;
      $scope.isShow = true;
    };

    $scope.onSubmit = function(id) {
      if ($scope.activiti !== undefined) {

        bpmnService.completeTask($scope.activiti).then(function(result) {
          alert('Task Complete');
          $scope.closeModal();
          return result;
        }, function(err) {
          alert('Error during the task execution : ' + err.data.message);
        });
      }
    };
  }
);