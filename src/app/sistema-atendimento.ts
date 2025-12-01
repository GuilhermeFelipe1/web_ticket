export interface Ticket {
  numero: string;
  tipo: 'SP' | 'SE' | 'SG';
  emissao: Date;
  status: string;
  inicioAtendimento?: Date;
  fimAtendimento?: Date;
  tempoMedioEstimado?: string;
  tempoSimulado?: string;

}

export class SistemaAtendimento {
  
  
  fila: Ticket[] = [];
  historicoChamadas: string[] = [];
  relatorio: Ticket[] = [];

  sequencia = { SP: 0, SG: 0, SE: 0 };

  proximaEPrioridade = true;
  atendimentoAtual: Ticket | null = null;
  
  // UI-bound variables (these replace document.getElementById)
  painelTicket: string = '----';
  painelGuiche: string = '--';
  statusMensagem: string = 'Sistema pronto.';
  
  // counters for HTML bindings
  qSP = 0;
  qSE = 0;
  qSG = 0;

  nextLogicText = 'SP (Prioritária)';

  constructor() {}

  private atualizarUI() {
    this.qSP = this.fila.filter(s => s.tipo === 'SP').length;
    this.qSE = this.fila.filter(s => s.tipo === 'SE').length;
    this.qSG = this.fila.filter(s => s.tipo === 'SG').length;

    this.nextLogicText = this.proximaEPrioridade ? "SP (Prioritária)" : "SE/SG (Normal)";
  }

  private gerarNumeroSenha(tipo: 'SP' | 'SE' | 'SG'): string {
    const agora = new Date();
    const yy = String(agora.getFullYear()).slice(-2);
    const mm = String(agora.getMonth() + 1).padStart(2, '0');
    const dd = String(agora.getDate()).padStart(2, '0');

    this.sequencia[tipo]++;
    const sq = String(this.sequencia[tipo]).padStart(2, '0');

    return `${yy}${mm}${dd}-${tipo}${sq}`;
  }

  emitirSenha(tipo: 'SP' | 'SE' | 'SG') {
    const novaSenha: Ticket = {
      numero: this.gerarNumeroSenha(tipo),
      tipo,
      emissao: new Date(),
      status: 'Aguardando',
      tempoSimulado: this.calcularTempoSimulado(tipo)
    };

    this.fila.push(novaSenha);
    this.relatorio.push(novaSenha);

    
    this.atualizarUI();
  }

  private obterProximaSenha(): Ticket | null {

    if (this.fila.length === 0) return null;

    const sps = this.fila.filter(s => s.tipo === 'SP');
    const ses = this.fila.filter(s => s.tipo === 'SE');
    const sgs = this.fila.filter(s => s.tipo === 'SG');

    let escolhida: Ticket | null = null;

    if (this.proximaEPrioridade) {
      if (sps.length > 0) {
        escolhida = sps[0];
        this.proximaEPrioridade = false;
      } else {
        if (ses.length > 0) escolhida = ses[0];
        else if (sgs.length > 0) escolhida = sgs[0];
      }
    } else {
      if (ses.length > 0) escolhida = ses[0];
      else if (sgs.length > 0) escolhida = sgs[0];
      else if (sps.length > 0) escolhida = sps[0];

      this.proximaEPrioridade = true;
    }

    return escolhida;
  }

  chamarProximo() {
    if (this.atendimentoAtual) {
      alert("Finalize o atendimento atual antes de chamar o próximo.");
      return;
    }

    const proxima = this.obterProximaSenha();
    if (!proxima) {
      this.statusMensagem = "Fila vazia.";
      return;
    }

    this.fila = this.fila.filter(s => s.numero !== proxima.numero);

    this.atendimentoAtual = proxima;
    this.atendimentoAtual.inicioAtendimento = new Date();
    this.atendimentoAtual.status = 'Em Atendimento';

    this.atualizarPainel(proxima);
    this.statusMensagem = `Atendendo: ${proxima.numero}`;

    this.atualizarUI();
  }

  finalizarAtendimento(ausente: boolean) {
    if (!this.atendimentoAtual) return;

    const t = this.atendimentoAtual;
    t.fimAtendimento = new Date();

    if (ausente) {
      t.status = 'Ausente/Descartada';
      t.tempoMedioEstimado = '0 min';
    } else {
      t.status = 'Atendido';
      t.tempoMedioEstimado = this.calcularTempoSimulado(t.tipo);
    }

    this.atendimentoAtual = null;
    this.statusMensagem = "Guichê Livre.";

    this.atualizarUI();
  }

  private calcularTempoSimulado(tipo: 'SP' | 'SG' | 'SE'): string {
    let tempo = 0;
    const rnd = Math.random();

    if (tipo === 'SP') tempo = 15 + (Math.random() * 10 - 5);
    if (tipo === 'SG') tempo = 5 + (Math.random() * 6 - 3);
    if (tipo === 'SE') tempo = rnd < 0.95 ? 0.8 : 5;

    return tempo.toFixed(1) + " min";
  }
  
getTempoEstimado(t: Ticket): string {
  if (!t || !t.tipo) return "-";
  return this.calcularTempoSimulado(t.tipo); 
}

  private atualizarPainel(ticket: Ticket) {
    if (this.painelTicket !== '----') {
      this.historicoChamadas.unshift(this.painelTicket);
      if (this.historicoChamadas.length > 5) this.historicoChamadas.pop();
    }

    this.painelTicket = ticket.numero;
    this.painelGuiche = "01";
  }

  getEstatisticas() {
  const totalEmitidos = this.relatorio.length;

  const totalConcluidos = this.relatorio.filter(
    t => t.status === 'Atendido'
  ).length;

  const totalSP = this.relatorio.filter(
    t => t.tipo === 'SP'
  ).length;

  const totalSPConcluidos = this.relatorio.filter(
    t => t.tipo === 'SP' && t.status === 'Atendido'
  ).length;

  return {
    totalEmitidos,
    totalConcluidos,
    totalSP,
    totalSPConcluidos
  };
}




}