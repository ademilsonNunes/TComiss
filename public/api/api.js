const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();

// Configuração do CORS
app.use(cors());

// Configuração do banco de dados Protheus ERP
const configErp = {
  user: 'sa',
  password: 'Totvs@2022$$',
  server: '192.168.0.16',
  database: 'Protheus_Producao',

  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};

// Configuração manual do CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rora  para API - retorna comissão por vendedor 
app.get('/api/TReportComiss', (req, res) => {
  const vendedor = req.query.vendedor;
  const dataInicial = req.query.dataInicial.replace(/-/g, '');
  const dataFinal = req.query.dataFinal.replace(/-/g, '');

  sql.connect(configErp, (err) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
      return;
    }




    const sqlComiss = `EXEC GETCOMISSDETALHE '20230101', '20231231', '${dataInicial}', '${dataFinal}', '${vendedor}'`;
    
    new sql.Request().query(sqlComiss, (err, resultComiss) => {
      if (err) {
        console.error('Erro na consulta GETCOMISSDETALHE:', err);
        res.status(500).json({ error: 'Erro ao executar a consulta GETCOMISSDETALHE' });
        return;
      }

      const pedidos = {};

      resultComiss.recordset.forEach((comiss) => {
        let comissItem = 0;

        if (comiss.COMIS_CLI !== 0) {
          comissItem =
            ((parseFloat(comiss.VLRBRUTO) - parseFloat(comiss.FTCOM) * parseFloat(comiss.VLRBRUTO) / 100 - parseFloat(comiss.CONTRATO) * parseFloat(comiss.VLRBRUTO) / 100) *
              parseFloat(comiss.COMIS_CLI)) /
            100;
        } else if (comiss.COMIS_VEND !== 0) {
          comissItem =
            ((parseFloat(comiss.VLRBRUTO) - parseFloat(comiss.FTCOM) * parseFloat(comiss.VLRBRUTO) / 100 - parseFloat(comiss.CONTRATO) * parseFloat(comiss.VLRBRUTO) / 100) *
              parseFloat(comiss.COMIS_VEND)) /
            100;
        } else {
          comissItem =
            ((parseFloat(comiss.VLRBRUTO) - parseFloat(comiss.FTCOM) * parseFloat(comiss.VLRBRUTO) / 100 - parseFloat(comiss.CONTRATO) * parseFloat(comiss.VLRBRUTO) / 100) *
              parseFloat(comiss.COMIS_PROD)) /
            100;
        }

        if (pedidos[comiss.PEDIDO]) {
          pedidos[comiss.PEDIDO].comissao += comissItem;
          pedidos[comiss.PEDIDO].liquido += parseFloat(comiss.VLRLIQ);
        } else {
          pedidos[comiss.PEDIDO] = {
            vendedor: comiss.VEND,
            pedido: comiss.PEDIDO,
            comissao: comissItem,
            liquido: parseFloat(comiss.VLRLIQ),
            comissao_dev: 0,
            liquido_dev: 0,
            dtEmissao: comiss.DTEMISSAO,
            vencto: comiss.VENCTO,
            dtBaixa: comiss.DTBAIXA,
            codCliente: comiss.CODCLIENTE,
            cliente: comiss.CLIENTE,
            tipo: 'c'
          };
        }
      });

      const sqlDevComiss = `EXEC GETDEVCOMISSDETALHE '20230101', '20231231', '${dataInicial}', '${dataFinal}', '${vendedor}'`;
      new sql.Request().query(sqlDevComiss, (err, resultDevComiss) => {
        if (err) {
          console.error('Erro na consulta GETDEVCOMISSDETALHE:', err);
          res.status(500).json({ error: 'Erro ao executar a consulta GETDEVCOMISSDETALHE' });
          return;
        }

        resultDevComiss.recordset.forEach((devComiss) => {
          let comissDevItem = 0;

          if (devComiss.COMIS_CLI !== 0) {
            comissDevItem =
              ((parseFloat(devComiss.VLRBRUTO) - parseFloat(devComiss.FTCOM) * parseFloat(devComiss.VLRBRUTO) / 100 - parseFloat(devComiss.CONTRATO) * parseFloat(devComiss.VLRBRUTO) / 100) *
                parseFloat(devComiss.COMIS_CLI)) /
              100;
          } else if (devComiss.COMIS_VEND !== 0) {
            comissDevItem =
              ((parseFloat(devComiss.VLRBRUTO) - parseFloat(devComiss.FTCOM) * parseFloat(devComiss.VLRBRUTO) / 100 - parseFloat(devComiss.CONTRATO) * parseFloat(devComiss.VLRBRUTO) / 100) *
                parseFloat(devComiss.COMIS_VEND)) /
              100;
          } else {
            comissDevItem =
              ((parseFloat(devComiss.VLRBRUTO) - parseFloat(devComiss.FTCOM) * parseFloat(devComiss.VLRBRUTO) / 100 - parseFloat(devComiss.CONTRATO) * parseFloat(devComiss.VLRBRUTO) / 100) *
                parseFloat(devComiss.COMIS_PROD)) /
              100;
          }

          if (pedidos[devComiss.PEDIDO]) {
            pedidos[devComiss.PEDIDO].comissao_dev += comissDevItem;
            pedidos[devComiss.PEDIDO].liquido_dev += parseFloat(devComiss.VLRLIQ);
          } else {
            pedidos[devComiss.PEDIDO] = {
              vendedor: devComiss.VEND,
              pedido: devComiss.PEDIDO,
              comissao: 0,
              liquido: 0,
              comissao_dev: comissDevItem,
              liquido_dev: parseFloat(devComiss.VLRLIQ),
              dtEmissao: devComiss.DTEMISSAO,
              vencto: devComiss.VENCTO,
              dtBaixa: devComiss.DTBAIXA,
              codCliente: devComiss.CODCLIENTE,
              cliente: devComiss.CLIENTE,
              tipo: 'd' 
            };
          }
        });

        const jsonOutput = JSON.stringify(Object.values(pedidos));
        res.send(jsonOutput);
      });
    });
  });
});

// Inicialização do servidor
app.listen(3000, () => {
  console.log('API iniciada na porta 3000');
});
