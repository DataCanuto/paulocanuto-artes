export const periodo = (inicio, fim) => {
  if (!inicio) return '';
  return inicio === fim ? `${inicio}` : `de ${inicio} a ${fim}`;
};

export const quantidade = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

// "Acrílica sobre tecido", ou só o suporte quando não há técnica ("Camisa algodão")
export const material = ({ tecnica, suporte }) => {
  if (tecnica && suporte) return `${tecnica} sobre ${suporte.toLowerCase()}`;
  return tecnica ?? suporte ?? '';
};

export const medidaEAno = ({ dimensoes_cm, ano }) => [dimensoes_cm, ano].filter(Boolean).join(', ');
