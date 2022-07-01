sap.ui.define([

], function () {

    return {

        // formato fecha odata a formato AAAA-MM-DD
        fecha: function ( dParam ) {

            let dia, mes, anio;

            if ( dParam ) {
                dFecha = new Date( dParam );
                dFecha.setHours(dFecha.getHours() + 5); //test
                dia = dFecha.getDate().toString();
                mes = ( dFecha.getMonth() + 1 ).toString();
                anio = dFecha.getFullYear().toString();
                dia = dia.padStart(2,'0');
                mes = mes.padStart(2,'0');
                return `${anio}-${mes}-${dia}`;
            }
            
        },

        // formato numero odata a formato X,XXX,XXX.XX
        numero2d : function ( sParam ) {
            const nDecimals = 2;
            if ( sParam ) {
                return Number( sParam ).toLocaleString('en-US', { minimumFractionDigits: nDecimals });
            }
        },

        // formato numero odata a formato numero (general)
        numero : function ( sParam ) {
            const nDecimals = 0;
            if ( sParam ) {
                return Number( sParam ).toLocaleString('en-US', { minimumFractionDigits: nDecimals });
            }
        }

        /*// formato boolean odata a formato 'X'/''
        loekz : function ( vParam ) {
            
            if ( vParam != undefined || vParam != null ) {
                if ( vParam ) {
                    return 'X';
                } else {
                    return '';
                }     
            }

        }*/

    }
});