sap.ui.define([
    "sap/ui/core/mvc/Controller",
    //"sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',
    "../model/Formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageToast} MessageToast
     * @param {typeof sap.ui.model.mvc.Filter} Filter
     * @param {typeof sap.ui.model.mvc.FilterOperator} FilterOperator
     */
    function (Controller, JSONModel, MessageToast, Filter, FilterOperator, Spreadsheet, exportLibrary, Formatter) {
        "use strict";

        // definición para llamado a servicio
        var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/Z_PLT_ELEM_PEP_SRV/");
        var that;
        var oSelectDialog, oSelectDialogTc, oSelectDialogEt, oSelectDialogPry, oSelectDialogAdm, oSelectDialogZn;
        var EdmType = exportLibrary.EdmType;
        var aFilter = [], frentes = [], tipCam = [], etapa= [], pry = [], adm = [], zona = [], aFilterAdm = [], aFilterZn = [];
        var storage;
        var busyDialog = new sap.m.BusyDialog()

        return Controller.extend("aip.zplelempep.controller.Master", {

            formatter: Formatter,

            onInit: function () {
                oDataModel = this.getOwnerComponent().getModel("oDataService");
                this.setDefaultValues(); // Asignando valores predeterminados 
                /*this.onFilterElempep();
                //this.getElemPepData();
                this.loadMatchcodeFc();
                this.loadMatchcodeTc();*/

                /*const odataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/Z_PLT_ELEM_PEP_SRV");
                var oModel = new sap.ui.model.json.JSONModel();
                odataModel.read("/PltElementoPepSet",{
                    success:function(oData,oResponse){
                        MessageToast.show("Success");
                         oModel.setData(oData);
                         console.log('oResponse',oResponse);
                         console.log('oData',oData);
                    },
                    error: function(oError){
                        MessageToast.show("Error");
                    }
                });
                this.getView().setModel(oModel, "oData");*/
            },

            setDefaultValues: function () {

                let keys = [];

                // Obtener valores de la ultima sessión
                if ( localStorage.getItem('data-temp') ) {

                    storage = JSON.parse( localStorage.getItem('data-temp') );

                    for (const st of storage) {
                        switch ( st.sPath ) {
                            //case "Posid": this.getView().byId("txtElementoPep").setValue( st.oValue1 ); break;
                            //case "Post1": this.getView().byId("txtDescripcionElemPep").setValue( st.oValue1 ); break;
                            //case "DescCampo": this.getView().byId("txtDesCampo").setValue( st.oValue1 ); break;
                            case "Clave": this.getView().byId("txtClave").setValue( st.oValue1 ); break;
                            case "FrenteCos": this.getView().byId("txtFrenteCos").setValue( st.oValue1 ); break;
                            case "Tipcampo": this.getView().byId("txtTipCampo").setValue( st.oValue1 ); break;
                            /*case "FecNacPlnt": 
                                this.getView().byId("txtFechasNac").setDateValue( new Date(st.oValue1) );
                                this.getView().byId("txtFechasNac").setSecondDateValue( new Date(st.oValue2) );
                                break;
                            case "Ffincos": 
                                this.getView().byId("txtFechasFinCos").setDateValue( new Date(st.oValue1) );
                                this.getView().byId("txtFechasFinCos").setSecondDateValue( new Date(st.oValue2) );
                                break;
                            */
                            case "Proyecto": this.getView().byId("txtProyecto").setValue( st.oValue1 ); break;
                            case "Admin": this.getView().byId("txtAdmin").setValue( st.oValue1 ); break;
                            case "Zona": this.getView().byId("txtZona").setValue( st.oValue1 ); break;
                            case "Etapa": this.getView().byId("txtEtapa").setValue( st.oValue1 ); break;
                            //case "Status2": this.getView().byId("txtStatus").setValue( st.oValue1 ); break;
                            case "Status1": 
                                switch ( st.oValue1 ) {
                                    case 'Anulado': keys.push( "0" ); break;
                                    case 'Abierto': keys.push( "1" ); break;
                                    case 'Planeado': keys.push( "2" ); break;
                                    case 'Cerrado': keys.push( "3" ); break;
                                    default: break;
                                }
                                break;
                            default: break;
                        }
                    }
                    
                    if ( keys.length > 0) {
                        this.getView().byId("mcboStatus").setSelectedKeys( keys );
                    }                 

                } else {
                    // datos default
                    //let fechasNaci = this.getView().byId("txtFechasNac");
                    let proy = this.getView().byId("txtProyecto");
                    //let dFecha = new Date();
                    //let dproy = 'P01';
                    //fechasNaci.setDateValue(dFecha);
                    //fechasNaci.setSecondDateValue(dFecha);
                    //proy.setValue(dproy);
                }

                this.onFilterElempep(); // Carga de datos de elemento pep
                // this.loadStatus(); //-AXELERA
                // this.loadMatchcodeFc(); // Carga de datos de frentes //-AXELERA
                // this.loadMatchcodeTc(); // Carga de datos de tipo de campo //-AXELERA
                // this.loadMatchcodeEt(); // Carga de datos de etapas //-AXELERA
                // this.loadMatchcodePry(); // Carga de datos de proyectos //-AXELERA
                // this.onFilterAdm(); //-AXELERA
                // //this.loadMatchcodeAdm(); // Carga de datos de administracion //-AXELERA
                // this.onFilterZn(); //-AXELERA
                // //this.loadMatchcodeZn(); // Carga de datos de zona //-AXELERA
            },

            getElemPepData: function () {
                const oModel = new sap.ui.model.json.JSONModel();
                that = this;
                busyDialog.open();
                // invocación de servicio odata
                oDataModel.read("/PltElementoPepSet", {
                    filters: aFilter,
                    success: function (oData, oResponse) {
                        MessageToast.show("Carga completa");
                        oModel.setData(oData);
                        console.log("ingresa aqui odata elemento pep")
                        busyDialog.close();
                        console.log( oData, oResponse )
                        that.updateFooter(); // actualizar de datos para pie de tabla
                    },
                    error: function (oError) {
                        MessageToast.show("Error getelempepdata");
                        busyDialog.close();
                    }
                });

                this.getView().setModel(oModel, "oData");
            },
            /*
            getAdmData: function () {
                const oModel = new sap.ui.model.json.JSONModel();
                that = this;
                //busyDialog.open();
                // invocación de servicio odata
                oDataModel.read("/adminSet", {
                    filters: aFilterAdm,
                    success: function (oData, oResponse) {
                        //MessageToast.show("Carga completa");
                        oModel.setData(oData);
                        console.log("ingresa aqui odata adm")
                        //busyDialog.close();
                        console.log( oData )
                        //that.updateFooter(); // actualizar de datos para pie de tabla
                    },
                    error: function (oError) {
                        MessageToast.show("Error getAdmData");
                        //busyDialog.close();
                    }
                });

                this.getView().setModel(oModel, "oDataAdm");
            },
            */
            
            updateFooter: function () {

                let oTable = this.getView().byId("_IDGenTable1");
                let oRowsBinding = oTable.getBinding("rows");
                
                that = this;

                // cantidad de filas de tabla
                let oLength = oRowsBinding.getLength();
                that.getView().byId("txtCount").setText(that.formatter.numero(oLength));

                this.loadStatus(); //+AXELERA
                this.loadMatchcodeFc(); // Carga de datos de frentes //+AXELERA
                this.loadMatchcodeTc(); // Carga de datos de tipo de campo //+AXELERA
                this.loadMatchcodeEt(); // Carga de datos de etapas //+AXELERA
                this.loadMatchcodePry(); // Carga de datos de proyectos //+AXELERA
                this.onFilterAdm(); //+AXELERA
                //this.loadMatchcodeAdm(); // Carga de datos de administracion //+AXELERA
                this.onFilterZn(); //+AXELERA
                //this.loadMatchcodeZn(); // Carga de datos de zona //+AXELERA
            },
            
            loadMatchcodeFc: function () {

                that = this;

                const handleClose = function (oEvent) {

                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtFrenteCos");

                    if (oSelectedItem) {
                        // asignar valor en campo
                        oInput.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/FrenteCosSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "FrenteCosecha" );
                        frentes = oSelectDialog.getModel('oDataFrente').getData().results;
                    },
                    error: function (oError) {
                        //console.log( "Error matchcode", oResponse);
                        //console.log( "error mc FrenteCosecha",this.model );
                        MessageToast.show("Error matchcode fc");
                                            }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataFrente>DomvalueL}",
                    description: "{oDataFrente>Ddtext}"
                })

                // creación de control de ayuda de busqueda
                oSelectDialog = new sap.m.SelectDialog("CustDialogFc", {
                    title: "Frente de Cosecha",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("Ddtext", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                
                // carga de datos odata en ventana
                oSelectDialog.setModel(oModel, 'oDataFrente');

                // asignación de valores en filas y formato de los mismos
                oSelectDialog.bindAggregation("items", "oDataFrente>/results", itemTemplate);
                
            },   
            
            loadMatchcodeTc: function () {

                that = this;

                const handleClose = function (oEvent) {

                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtTipCampo");

                    if (oSelectedItem) {
                        // asignar valor en campo
                        oInput.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/TipCampoSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "TipoCampo" );
                        tipCam = oSelectDialogTc.getModel('oDataTipo').getData().results;
                    },
                    error: function (oError) {
                        //console.log( "Error matchcode", oResponse);
                        MessageToast.show("Error matchcode tc");
                    }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataTipo>DomvalueL}",
                    description: "{oDataTipo>Ddtext}"
                })

                // creación de control de ayuda de busqueda
                oSelectDialogTc = new sap.m.SelectDialog("CustDialogTc", {
                    title: "Tipo de Campo",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("Ddtext", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                
                // carga de datos odata en ventana
                oSelectDialogTc.setModel(oModel, 'oDataTipo');

                // asignación de valores en filas y formato de los mismos
                oSelectDialogTc.bindAggregation("items", "oDataTipo>/results", itemTemplate);
                
            },

            loadMatchcodeEt: function () {

                that = this;

                const handleClose = function (oEvent) {

                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtEtapa");

                    if (oSelectedItem) {
                        // asignar valor en campo
                        oInput.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                console.log( "Ingresa antes de invocacion servicio etapa 2");
                oDataModel.read("/etapaSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "Etapa" );
                        etapa = oSelectDialogEt.getModel('oDataEtapa').getData().results;
                    },
                    error: function (oError) {
                        //console.log( "Error matchcode", oResponse);
                        //console.log( "error mc FrenteCosecha",this.model );
                        MessageToast.show("Error matchcode et");
                                            }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataEtapa>etaCod}",
                    description: "{oDataEtapa>etaDes}"
                })

                // creación de control de ayuda de busqueda
                oSelectDialogEt = new sap.m.SelectDialog("CustDialogEt", {
                    title: "Etapa",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("etaDes", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                
                // carga de datos odata en ventana
                oSelectDialogEt.setModel(oModel, 'oDataEtapa');

                // asignación de valores en filas y formato de los mismos
                oSelectDialogEt.bindAggregation("items", "oDataEtapa>/results", itemTemplate);
                
            }, 

            loadMatchcodePry: function () {

                that = this;

                const handleClose = function (oEvent) {

                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtProyecto");
                    

                    if (oSelectedItem) {
                        // asignar valor en campo
                        oInput.setValue(oSelectedItem.getTitle())
                        that.getView().byId("txtAdmin").setValue(""); 
                        that.getView().byId("txtZona").setValue("");
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                    //destruye dialog
                    oSelectDialogAdm.destroy();
                    //filtra de acuerdo a proyecto
                    that.onFilterAdm();
                };

                const oModel1 = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/proyectoSet", {

                    success: function (oData, oResponse) {
                        oModel1.setData(oData);
                        console.log( oData );
                        pry = oSelectDialogPry.getModel('oDataPry').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchcode pry");
                                            }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataPry>cod_proy}",
                    description: "{oDataPry>desc}"
                })

                // creación de control de ayuda de busqueda
                oSelectDialogPry = new sap.m.SelectDialog("CustDialogPry", {
                    title: "Proyecto",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("desc", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                
                // carga de datos odata en ventana
                oSelectDialogPry.setModel(oModel1, 'oDataPry');

                // asignación de valores en filas y formato de los mismos
                oSelectDialogPry.bindAggregation("items", "oDataPry>/results", itemTemplate);                
            },

            loadMatchcodeAdm: function () {

                that = this;

                const handleClose = function (oEvent) {

                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtAdmin");

                    if (oSelectedItem) {
                        // asignar valor en campo
                        oInput.setValue(oSelectedItem.getTitle())
                        that.getView().byId("txtZona").setValue(""); 
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                    oSelectDialogZn.destroy();
                    that.onFilterZn();
                };
                
                const oModel = new sap.ui.model.json.JSONModel();
                
                // invocación de servicio
                oDataModel.read("/adminSet", {
                    filters : aFilterAdm,
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "Administración" );
                        adm = oSelectDialogAdm.getModel('oDataAdm').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchcode adm");
                                            }
                });
                
                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataAdm>cod_admin}",
                    description: "{oDataAdm>descrip}"
                })
                
                oSelectDialogAdm = new sap.m.SelectDialog("CustDialogAdm", {
                    title: "Administración",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("descrip", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                                
                // carga de datos odata en ventana
                oSelectDialogAdm.setModel(oModel, 'oDataAdm');

                // asignación de valores en filas y formato de los mismos
                oSelectDialogAdm.bindAggregation("items", "oDataAdm>/results", itemTemplate);   
      
            },

            loadMatchcodeZn: function () {

                that = this;

                const handleClose = function (oEvent) {

                    // obtener fila seleccionada
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    let oInput = that.getView().byId("txtZona");

                    if (oSelectedItem) {
                        // asignar valor en campo
                        oInput.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/zonaSet", {
                    filters : aFilterZn,
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "Zona" );
                        zona = oSelectDialogZn.getModel('oDataZn').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchcode zona");
                                            }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataZn>cod_zona}",
                    description: "{oDataZn>descrip}"
                })

                // creación de control de ayuda de busqueda
                oSelectDialogZn = new sap.m.SelectDialog("CustDialogZn", {
                    title: "Zona",
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("descrip", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter]);
                    },
                    confirm: handleClose
                });
                
                // carga de datos odata en ventana
                oSelectDialogZn.setModel(oModel, 'oDataZn');

                // asignación de valores en filas y formato de los mismos
                oSelectDialogZn.bindAggregation("items", "oDataZn>/results", itemTemplate);
                
            },
           
            onOpenDialogPressFc: function (oEvent) {
                oSelectDialog.open(); // mostrar ventana de matchcode de frentes
            },  
            
            onOpenDialogPressTc: function (oEvent) {
                oSelectDialogTc.open(); // mostrar ventana de matchcode de tipo de campo
            },

            onOpenDialogPressEt: function (oEvent) {
                oSelectDialogEt.open(); // mostrar ventana de matchcode de etapas
            },

            onOpenDialogPressPry: function (oEvent) {
                oSelectDialogPry.open(); // mostrar ventana de matchcode de etapas
                console.log("onOpenDialogPressPry despiues de abrir matchcode de pry" )
            },

            onOpenDialogPressAdm: function (oEvent) {
                oSelectDialogAdm.open(); // mostrar ventana de matchcode de administraciones                
            },

            onOpenDialogPressZn: function (oEvent) {
                oSelectDialogZn.open(); // mostrar ventana de matchcode de etapas
            },

            loadStatus: function () {

                let oModel = new JSONModel();

                // carga de opciones (estados)
                oModel.setData({
                    items: [
                        { key: "0", text: "Anulado" },
                        { key: "1", text: "Abierto" },
                        { key: "2", text: "Planeado" },
                        { key: "3", text: "Cerrado" }
                    ]
                });

                this.getView().setModel(oModel, "oStatusData");
            },
           
            onChangeFrente : function ( oEvent ) {

                let valor = oEvent.getParameter('value');

                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {

                    for (const iterator of frentes) {
                        if ( iterator.DomvalueL == valor ) {
                            return;
                        } 
                    }

                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado
                } 
            }, 
            
            onChangeTipo : function ( oEvent ) {

                let valor = oEvent.getParameter('value');

                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {

                    for (const iterator of tipCam) {
                        if ( iterator.DomvalueL == valor ) {
                            return;
                        } 
                    }

                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado
                } 
            },

            onChangeEtapa : function ( oEvent ) {

                let valor = oEvent.getParameter('value');

                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {

                    for (const iterator of etapa) {
                        if ( iterator.etaCod == valor ) {
                            return;
                        } 
                    }

                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado
                } 
            },

            onChangePry : function ( oEvent ) {

                let valor = oEvent.getParameter('value');

                //limpia caja de texto
                this.getView().byId("txtAdmin").setValue(""); 
                this.getView().byId("txtZona").setValue("");

                //destruye dialog
                oSelectDialogAdm.destroy();
                //filtra de acuerdo a proyecto
                this.onFilterAdm();

                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {

                    for (const iterator of pry) {
                        if ( iterator.cod_proy == valor ) {
                            return;
                        } 
                    }

                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado
                } 
                
            },

            onChangeAdm : function ( oEvent ) {
                let valor = oEvent.getParameter('value');

                //limpia caja de texto
                this.getView().byId("txtZona").setValue("");
                //destruye dialog
                oSelectDialogZn.destroy();
                //filtra de acuerdo a proyecto y adm
                this.onFilterZn();

                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {

                    for (const iterator of adm) {
                        if ( iterator.cod_admin == valor ) {
                            return;
                        } 
                    }

                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado
                } 

            },

            onChangeZona : function ( oEvent ) {

                let valor = oEvent.getParameter('value');

                this.getView().byId("btnFiltro").setEnabled( true ); // boton filtro activado
                oEvent.getSource().setValueState( sap.ui.core.ValueState.None );

                if ( valor ) {

                    for (const iterator of zona) {
                        if ( iterator.cod_zona == valor ) {
                            return;
                        } 
                    }

                    oEvent.getSource().setValueState( sap.ui.core.ValueState.Error );
                    this.getView().byId("btnFiltro").setEnabled( false ); // boton filtro desactivado
                } 
            },

            /*onGoToDetail: function ( oEvent ) {
                this.navigateToDetail( oEvent );
            },*/
            /*navigateToDetail: function ( oEvent ) {
                const sPath = oEvent.getSource().getBindingContext("oData").getPath();
                const selectedPath = oEvent.getSource().getBindingContext("oData").getProperty(sPath);
                console.log( 'selectedPath', selectedPath )
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDetail", {
                    detailPath: window.encodeURIComponent( JSON.stringify(selectedPath) )
                });
            },*/          
            
            onFilterElempep: function (oEvent) {
                console.log("ingresa aqui filter 1")
                storage = [];

                // obtener referencias y/o valores de filtros
                //let elemPep = this.getView().byId("txtElementoPep").getValue();
                //let descElem = this.getView().byId("txtDescripcionElemPep").getValue();
                //let desCampo = this.getView().byId("txtDesCampo").getValue();
                let clave = this.getView().byId("txtClave").getValue();
                let frenteCosecha = this.getView().byId("txtFrenteCos").getValue();
                let tipoCampo = this.getView().byId("txtTipCampo").getValue();
                /*let fechasNac = this.getView().byId("txtFechasNac");
                let fechasFinCos = this.getView().byId("txtFechasFinCos");*/
                let proyecto = this.getView().byId("txtProyecto").getValue();
                let admin = this.getView().byId("txtAdmin").getValue();
                let zona = this.getView().byId("txtZona").getValue();
                let etapa = this.getView().byId("txtEtapa").getValue();
                //let status = this.getView().byId("txtStatus").getValue();
                let estado = this.getView().byId("mcboStatus");

                this.getView().byId("txtCount").setText("");            // default value
                
                //let fechaNac1, fechaNac2, fechaFinCos1, fechaFinCos2;

                aFilter = [];
                /*
                // Filtro por descripcion de elemento PEP
                if (elemPep) {
                    aFilter.push(new Filter("Posid", FilterOperator.EQ, elemPep));
                } 
                */

                // Filtro por descripcion de elemento PEP
                /*if (descElem) {
                    aFilter.push(new Filter("Post1", FilterOperator.EQ, descElem));
                }*/

                // Filtro por clave
                if (clave) {
                    aFilter.push(new Filter("Clave", FilterOperator.Contains, clave));
                }
                
                /*
                // Filtro por descripcion de campo
                if (desCampo) {
                    aFilter.push(new Filter("DescCampo", FilterOperator.Contains, desCampo));
                } 
                */

                // Filtro por frente de cosecha
                if (frenteCosecha) {
                    aFilter.push(new Filter("FrenteCos", FilterOperator.EQ, frenteCosecha));
                } 
                
                // Filtro por tipo de campo
                if (tipoCampo) {
                    aFilter.push(new Filter("Tipcampo", FilterOperator.EQ, tipoCampo));
                }
                /*
                // Filtro rango de fechas de nacimiento de planta
                if (fechasNac.getDateValue()) {

                    fechaNac1 = new Date(fechasNac.getDateValue());
                    fechaNac1.setMilliseconds(0);
                    fechaNac1.setSeconds(0);
                    fechaNac1.setMinutes(0);
                    fechaNac1.setHours(0);
                    console.log('fechaNac1', fechaNac1)

                    fechaNac2 = new Date(fechasNac.getSecondDateValue());
                    fechaNac2.setMilliseconds(0);
                    fechaNac2.setSeconds(59);
                    fechaNac2.setMinutes(59);
                    fechaNac2.setHours(18);
                    console.log('fechaNac2', fechaNac2)

                    aFilter.push(new Filter({
                        path: "FecNacPlnt",
                        operator: FilterOperator.BT,
                        value1: fechaNac1,
                        value2: fechaNac2
                    }));

                }

                // Filtro rango de fechas de fin de cosecha
                if (fechasFinCos.getDateValue()) {

                    fechaFinCos1 = new Date(fechasFinCos.getDateValue());
                    fechaFinCos1.setMilliseconds(0);
                    fechaFinCos1.setSeconds(0);
                    fechaFinCos1.setMinutes(0);
                    fechaFinCos1.setHours(0);
                    console.log('fechaFinCos1', fechaFinCos1)

                    fechaFinCos2 = new Date(fechasFinCos.getSecondDateValue());
                    fechaFinCos2.setMilliseconds(0);
                    fechaFinCos2.setSeconds(59);
                    fechaFinCos2.setMinutes(59);
                    fechaFinCos2.setHours(18);
                    console.log('fechaFinCos2', fechaFinCos2)

                    aFilter.push(new Filter({
                        path: "Ffincos",
                        operator: FilterOperator.BT,
                        value1: fechaFinCos1,
                        value2: fechaFinCos2
                    }));
                }
                */
                
                // Filtro por proyecto
                if (proyecto) {
                    aFilter.push(new Filter("Proyecto", FilterOperator.EQ, proyecto));
                } 

                // Filtro por administracion
                if (admin) {
                    aFilter.push(new Filter("Admin", FilterOperator.EQ, admin));
                }

                // Filtro por zona
                if (zona) {
                    aFilter.push(new Filter("Zona", FilterOperator.EQ, zona));
                }

                // Filtro por etapa
                if (etapa) {
                    aFilter.push(new Filter("Etapa", FilterOperator.EQ, etapa));
                }

                // Filtro por status
                /*if (status) {
                    //aFilter.push(new Filter("Status2", FilterOperator.EQ, status));
                    aFilter.push(new Filter("Status2", FilterOperator.Contains, status));
                }*/

                // Filtro por status1
                if (estado.getSelectedKeys().length > 0) {
                    console.log("filtro estado")
                    for (const iterator of estado.getSelectedKeys()) {

                        switch (iterator) {
                            case '0':
                                aFilter.push(new Filter("Status1", FilterOperator.EQ, "Anulado"));
                                break;
                            case '1':
                                aFilter.push(new Filter("Status1", FilterOperator.EQ, "Abierto"));
                                break;
                            case '2':
                                aFilter.push(new Filter("Status1", FilterOperator.EQ, "Planeado"));
                                break;
                            case '3':
                                aFilter.push(new Filter("Status1", FilterOperator.EQ, "Cerrado"));
                                break;
                            default: break;
                        }
                    }
                }

                storage = [...aFilter];
                if ( storage.length > 0 ) {
                    localStorage.setItem('data-temp', JSON.stringify( storage ) )
                }
                              
                console.log("ingresa sale de filter onElempep")
                this.getElemPepData();
            },

            onFilterAdm: function (oEvent) {
                console.log("ingresa filtro adm")
                //obtener valor de proyecto
                let proyecto = this.getView().byId("txtProyecto").getValue();

                console.log(proyecto)
                aFilterAdm = [];
                if(proyecto) {
                    aFilterAdm.push(new Filter("proyecto", FilterOperator.EQ, proyecto));
                }
                //this.getAdmData();
                this.loadMatchcodeAdm();

            },

            onFilterZn: function (oEvent) {
                console.log("ingresa filtro zona")
                //obtener valor de proyecto
                let proyecto = this.getView().byId("txtProyecto").getValue();
                let adm = this.getView().byId("txtAdmin").getValue();
                console.log(proyecto)
                console.log(adm )
                aFilterZn = [];
                if(proyecto) {
                    aFilterZn.push(new Filter("proyecto", FilterOperator.EQ, proyecto));
                }
                if(adm) {
                    aFilterZn.push(new Filter("admin", FilterOperator.EQ, adm));
                }
                this.loadMatchcodeZn();
            },

            createColumnConfig: function () {

                // definición de columnas a exportar
                var aCols = [];
                var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                
                console.log( oResourceBundle.getText('PSPNR') );                

                //aCols.push({ label: oResourceBundle.getText('PSPNR'), property: 'Pspnr', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('PROYECTO'), property: 'Proyecto', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('POSID'), property: 'Posid', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('ADMIN'), property: 'Admin', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCADMIN'), property: 'DescAdm', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('ZONA'), property: 'Zona', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCZONA'), property: 'DescZona', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('FRENTECOS'), property: 'FrenteCos', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('TIPCAMPO'), property: 'Tipcampo', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('ETAPA'), property: 'Etapa', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('CAM_QUIEBRE'), property: 'CampoQuieb', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('STATUS'), property: 'Status2', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('STATUS1'), property: 'Status1', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('CLAVE'), property: 'Clave', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCCAMPO'), property: 'DescCampo', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('USR04'), property: 'Usr04', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('HASNETAS'), property: 'HasNetas', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('VARIEDAD'), property: 'Variedad', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('NROCORTE'), property: 'NroCorte', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('TIPSUELO'), property: 'Tipsuelo', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('FECNACPLNT'), property: 'FecNacPlnt', type: EdmType.Date });
                aCols.push({ label: oResourceBundle.getText('EDAD'), property: 'Edad', type: EdmType.Number, scale: 1, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('ZZKMDIST'), property: 'ZzKmdist', type: EdmType.Number, scale: 2, delimiter: true });
                /*aCols.push({ label: oResourceBundle.getText('FECINIAGOSTE'), property: 'FecIniAgoste', type: EdmType.Date });
                aCols.push({ label: oResourceBundle.getText('FECMADURANTE'), property: 'FecMadurante', type: EdmType.Date });
                aCols.push({ label: oResourceBundle.getText('FINICOS'), property: 'Finicos', type: EdmType.Date });
                aCols.push({ label: oResourceBundle.getText('RENDESP'), property: 'RendEsp', type: EdmType.Number, scale: 2, delimiter: true });
                aCols.push({ label: oResourceBundle.getText('SACESP'), property: 'SacEsp', type: EdmType.Number, scale: 2, delimiter: true });*/
                //aCols.push({ label: oResourceBundle.getText('CODFUENTE'), property: 'CodFuente', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCFUENTE'), property: 'DescFuente', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('CODFORMA'), property: 'CodForma', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCFORMA'), property: 'DescForma', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('ZZLTLRG'), property: 'Zzltlrg', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCLTR'), property: 'DescLtr', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('ZZBOCTM'), property: 'Zzboctm', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('DESCBCT'), property: 'DescBct', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('CORRELATIVO'), property: 'Correlativo', type: EdmType.String });
                //aCols.push({ label: oResourceBundle.getText('USR00'), property: 'Usr00', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('ERNAM'), property: 'Ernam', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('ERDAT'), property: 'Erdat', type: EdmType.Date });
                aCols.push({ label: oResourceBundle.getText('AENAM'), property: 'Aenam', type: EdmType.String });
                /*
                aCols.push({ label: oResourceBundle.getText('CAMPO'), property: 'Campo', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('QUIEBRE'), property: 'Quiebre', type: EdmType.String });              
                aCols.push({ label: oResourceBundle.getText('CAMPANA'), property: 'Campana', type: EdmType.String });
                aCols.push({ label: oResourceBundle.getText('POST1'), property: 'Post1', type: EdmType.String });             
                aCols.push({ label: oResourceBundle.getText('OBJNR'), property: 'Objnr', type: EdmType.String });
                */
                return aCols;
            },

            onExport: function () {

                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('_IDGenTable1');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('rows');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols, // asignación de columnas 
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'reporte.xlsx', // nombre de archivo a descargar
                    worker: true
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            }

        });
    });