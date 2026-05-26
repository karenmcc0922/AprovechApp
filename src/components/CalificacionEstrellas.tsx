import { useState } from "react";
import { Star, Loader2 } from "lucide-react";

interface CalificacionProps {
  pedidoId: number;
  aliadoId: number;
  calificacionInicial?: number;
}

export default function CalificacionEstrellas({ pedidoId, aliadoId, calificacionInicial = 0 }: CalificacionProps) {
  const [rating, setRating] = useState<number>(calificacionInicial);
  const [hover, setHover] = useState<number>(0);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [guardado, setGuardado] = useState<boolean>(calificacionInicial > 0);

  const enviarCalificacion = async (nota: number) => {
    if (guardado || enviando) return;
    
    setEnviando(true);
    try {
      // Llamada al endpoint de tu API para registrar la reseña/calificación
      const response = await fetch("https://aprovechapp-api.onrender.com/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: pedidoId,
          aliado_id: aliadoId,
          puntuacion: nota
        }),
      });

      if (response.ok) {
        setRating(nota);
        setGuardado(true);
      }
    } catch (error) {
      console.error("Error al guardar la calificación:", error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
        {guardado ? "Tu calificación" : "Califica el comercio"}
      </span>
      
      <div className="flex items-center gap-1">
        {enviando ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
        ) : (
          [1, 2, 3, 4, 5].map((estrella) => {
            const activa = estrella <= (hover || rating);
            return (
              <button
                key={estrella}
                type="button"
                disabled={guardado}
                onClick={() => enviarCalificacion(estrella)}
                onMouseEnter={() => !guardado && setHover(estrella)}
                onMouseLeave={() => !guardado && setHover(0)}
                className={`transition-all ${guardado ? "cursor-default" : "cursor-pointer hover:scale-125"}`}
              >
                <Star
                  size={16}
                  className={activa ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}