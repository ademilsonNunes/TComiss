$(document).ready(function() {
    $('#reportForm').submit(function(event) {
      event.preventDefault();
      obterDadosRelatorio();
    });
  
    function obterDadosRelatorio() {
      // Obter os valores dos campos do formulário
      var vendedor = $('#vendedor').val();
      var dataInicial = $('#dataInicial').val().replace(/-/g, '');
      var dataFinal = $('#dataFinal').val().replace(/-/g, '');
  
      // Fazer a requisição AJAX para a API
      $.ajax({
        url: 'http://localhost:3000/api/TReportComiss?'
          + 'vendedor=' + encodeURIComponent(vendedor)
          + '&dataInicial=' + encodeURIComponent(dataInicial)
          + '&dataFinal=' + encodeURIComponent(dataFinal),
        method: 'GET',
        dataType: 'json',
        success: function(response) {
          exibirTabelasRelatorio(response);
        },
        error: function() {
          exibirMensagemErro();
        }
      });
    }
  
    function exibirTabelasRelatorio(data) {
      // Montar as tabelas com os dados retornados
      var tableComissao = '<table class="table table-striped">';
      tableComissao += '<thead><tr><th>RCA</th><th>Pedido</th><th>Cliente</th><th>Valor Líquido</th><th>Comissão</th></tr></thead>';
      tableComissao += '<tbody>';
  
      var tableDevolucao = '<table class="table table-striped">';
      tableDevolucao += '<thead><tr><th>RCA</th><th>Pedido</th><th>Cliente</th><th>Valor Líquido Devolução</th><th>Comissão Devolução</th></tr></thead>';
      tableDevolucao += '<tbody>';
  
      var totalLiquidoComissao = 0;
      var totalComissao = 0;
      var totalLiquidoDevolucao = 0;
      var totalComissaoDevolucao = 0;
  
      $.each(data, function(index, item) {
        if (item.tipo == 'c') {
          tableComissao += '<tr>';
          tableComissao += '<td>' + item.vendedor + '</td>';
          tableComissao += '<td>' + item.pedido + '</td>';
          tableComissao += '<td>' + item.cliente + '</td>';
          tableComissao += '<td>' + formatarValor(item.liquido) + '</td>';
          tableComissao += '<td>' + formatarValor(item.comissao) + '</td>';
          tableComissao += '</tr>';
  
          totalLiquidoComissao += item.liquido;
          totalComissao += item.comissao;
        } else {
          tableDevolucao += '<tr>';
          tableDevolucao += '<td>' + item.vendedor + '</td>';
          tableDevolucao += '<td>' + item.pedido + '</td>';
          tableDevolucao += '<td>' + item.cliente + '</td>';
          tableDevolucao += '<td>' + formatarValor(item.liquido_dev) + '</td>';
          tableDevolucao += '<td>' + formatarValor(item.comissao_dev) + '</td>';
          tableDevolucao += '</tr>';
  
          totalLiquidoDevolucao += item.liquido_dev;
          totalComissaoDevolucao += item.comissao_dev;
        }
      });
  
      tableComissao += '</tbody></table>';
      tableDevolucao += '</tbody></table>';
  
      var totalComissaoElement = '<p>Total Comissão: ' + formatarValor(totalComissao) + '</p>';
      var totalLiquidoComissaoElement = '<p>Total Líquido Comissão: ' + formatarValor(totalLiquidoComissao) + '</p>';
      var totalComissaoDevolucaoElement = '<p>Total Comissão Devolução: ' + formatarValor(totalComissaoDevolucao) + '</p>';
      var totalLiquidoDevolucaoElement = '<p>Total Líquido Devolução: ' + formatarValor(totalLiquidoDevolucao) + '</p>';
  
      $('#reportTable').html('<h2>Comissão</h2>' + tableComissao + '<h2>Devolução</h2>' + tableDevolucao +
        '<h2>Totais</h2>' + totalComissaoElement + totalLiquidoComissaoElement + totalComissaoDevolucaoElement + totalLiquidoDevolucaoElement);
    }
  
    function exibirMensagemErro() {
      $('#reportTable').html('Erro ao obter os dados do relatório.');
    }
  
    // Função para formatar valores monetários no padrão brasileiro
    function formatarValor(valor) {
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  });
  