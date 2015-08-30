package controllers

import javax.inject._

import akka.actor._
import play.api.Play.current
import play.api.mvc._

@Singleton
class Application @Inject()(actorSystem: ActorSystem) extends Controller {

  val game = actorSystem.actorOf(Props[Game])

  def socket = WebSocket.acceptWithActor[String, String] { request =>
    (client:ActorRef) => Props(classOf[PlayerActor], client, game)
  }

  def index = Action {
    Ok(views.html.index("Mkay."))
  }

}
