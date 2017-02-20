'use strict';

angular.module('esn.bpmn')
  .controller('bpmnController', function($scope, $window, $http, bpmnLoader, bpmnService, userService, $modal, tokenService, notificationFactory) {

    $scope.userToken = tokenService.getToken();

    var myBpmnListModal = $modal({title: 'BPMN List', scope: $scope, template: 'bpmnJs/views/html/bpmnList.html', show: false});
    $scope.showModal = function(id) {
      $scope.listBpmnFile = listFile();
      myBpmnListModal.show();
    };

    var myFormTaskModal = $modal({title: 'Activiti form task', scope: $scope, template: 'bpmnJs/views/html/formly.html', show: false});
    $scope.showFormTaskModal = function(id) {
      myFormTaskModal.show();
    };

    var myListTaskModal = $modal({title: 'Activiti list task', scope: $scope, template: 'bpmnJs/views/html/listTask.html', show: false});
    $scope.showListTaskModal = function(id) {
      myListTaskModal.show();
    };

    $scope.closeModal = function() {
      myBpmnListModal.hide();
      myFormTaskModal.hide();
      myListTaskModal.hide();
    };

    var initDiagramXml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><bpmn:definitions xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\"><bpmn:process id=\"Process_1\" isExecutable=\"false\" /><bpmndi:BPMNDiagram id=\"BPMNDiagram_1\"><bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_1\" /></bpmndi:BPMNDiagram></bpmn:definitions>';

    var $ = $window.jQuery,
        BpmnModeler = bpmnLoader.bpmnModeler();

    var propertiesPanelModule = bpmnLoader.bpmnPropertiesPanel(),
        propertiesProviderModule = bpmnLoader.bpmnPropertiesPanelProvider();

    var container = $('#js-drop-zone');
    var canvas = $('#js-canvas');

    var bpmnModeler = new BpmnModeler({
      container: canvas,
      propertiesPanel: {
        parent: '#js-properties-panel'
      },
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule
      ],
      moddleExtensions: {
        camunda: bpmnLoader.camundaModdleDescriptor()
      }
    });

    function userInfo() {
      return userService.userInfo().then(function(result) {
        $scope.userInfo = result;
        return result;
      }, function(err) {
        notificationFactory.weakError('Error', err);
      });
    }

    $scope.userInfo = userInfo();

    function importNewDiagram(importXml) {
      openDiagram(importXml);
    }

    function initDiagram() {
      openDiagram(initDiagramXml);
    }

    function openDiagram(xml) {
      bpmnModeler.importXML(xml, function(err) {

        if (err) {
          container
            .removeClass('with-diagram')
            .addClass('with-error');

          container.find('.error pre').text(err.message);
          console.error(err);
        } else {
          container
            .removeClass('with-error')
            .addClass('with-diagram');
        }
      });
    }

    function saveDiagram(done) {
      bpmnModeler.saveXML({ format: true }, function(err, xml) {
        done(err, xml);
      });
    }

    function listFile() {
      return userService.listFile().then(function(result) {
        $scope.listBpmnFile = result.data;
        return result.data;
      }, function(err) {
        notificationFactory.weakError('Error', err);
      });
    }

    $scope.listBpmnFile = listFile();

    $scope.deleteFile = function(id, index) {
      userService.deleteFile(id);
      $scope.listBpmnFile.splice(index, 1);
    };

    $scope.readServerFile = function(id) {
      userService.selectFile(id).then(function(result) {
        importNewDiagram(result.data);
        $scope.closeModal();
      }, function(err) {
        notificationFactory.weakError('Error', err);
      });
    };

    $scope.saveXMLServer = function() {
      saveDiagram(function(err, xml) {
        if (err) {
          notificationFactory.weakError('Error', 'BPMN isn\'t initialized :' + err);
        } else {
          var blob = new Blob([xml], {type: 'text/xml'});
          var fileName = bpmnModeler.definitions.rootElements[0].id;

          var fileOfBlob = new File([blob], fileName);
          userService.writeFile(fileOfBlob);
        }
      });
    };

    $scope.activitiWebService = function() {
      saveDiagram(function(err, xml) {
        if (err) {
          notificationFactory.weakError('Error', 'BPMN isn\'t initialized :' + err);
        } else {
          var blob = new Blob([xml], {type: 'text/xml'});
          var fileName = bpmnModeler.definitions.rootElements[0].id;

          var fileOfBlob = new File([blob], fileName);
          bpmnService.activitiWebService(fileOfBlob);
        }
      });
    };

    $scope.initDiagram = function() {
      initDiagram();
    };

    $scope.saveXML = function() {
      saveDiagram(function(err, xml) {
        if (err) {
          notificationFactory.weakError('Error', 'BPMN isn\'t initialized');
        } else {
          if (saveAs) {
            var fileName = bpmnModeler.definitions.rootElements[0].id;
            var file = new File([xml], fileName, {type: 'text/plain'});
            saveAs(file);
          } else {
            notificationFactory.weakError('Error', 'Save file is not supported');
          }
        }
      });
    };

    $scope.file_changed = function(element) {
      var newXml;

      $scope.$apply(function(scope) {
        var fileXML = element.files[0];
        var reader = new FileReader();
        reader.onload = function(xml) {
          importNewDiagram(xml.target.result);
        };
        newXml = reader.readAsBinaryString(fileXML);
      });
      initDiagram();
    };
  }
);
