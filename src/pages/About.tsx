import { TopBar } from '../components/TopBar'
import { api } from '../lib/api'

export function About() {
  return (
    <>
      <TopBar title="À propos" back />
      <div className="mx-auto max-w-xl px-4 pt-4 pb-28 space-y-4 text-[15px] leading-relaxed">
        <p><b>HEC Launchpad</b> est la plateforme de la promo : poster une idée, trouver un cofondateur, voter et commenter.</p>
        <p>Accès réservé aux adresses email HEC. Les données (profil, idées, commentaires) sont visibles par les membres connectés uniquement.</p>
        <p>Pour supprimer ton compte et tes données, contacte l'équipe Launchpad.</p>
        <p className="muted text-sm">Mode : {api.mode}. Code source et déploiement sur GitHub.</p>
        <p className="muted text-sm">Astuce : ajoute l'app à ton écran d'accueil (Partager → Sur l'écran d'accueil) pour l'utiliser comme une app native.</p>
      </div>
    </>
  )
}
