using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace WebHelper.Controllers {
	public class MarkerController : Controller {
		private const int MarkerSize = 16;

		private static readonly Regex RgbColorRegex = new Regex(@"(\d{1,3}),(\d{1,3}),(\d{1,3})");
		private static readonly Func<Group, byte> Parse = group => (byte)int.Parse(group.Value);

		private static bool TryParseRgbColor(string colorString, out Color? color) {
			color = null;
			if (RgbColorRegex.IsMatch(colorString)) {
				var groups = RgbColorRegex.Match(colorString).Groups;
				Group r = groups[1], g = groups[2], b = groups[3];
				color = Color.FromArgb(Parse(r), Parse(g), Parse(b));
			}
			return false;
		}

		private static Color ParseColor(string colorString) {
			Color? color;
			if (!TryParseRgbColor(colorString, out color)) {
				try {
					color = ColorTranslator.FromHtml(colorString);
				} catch { /* ignored */ }
			}
			return color ?? Color.Red;
		}

		public ActionResult Circle(string color) {
			using (Image image = new Bitmap(MarkerSize, MarkerSize)) {
				using (Graphics graphics = Graphics.FromImage(image)) {
					graphics.SmoothingMode = SmoothingMode.AntiAlias;
					using (SolidBrush brush = new SolidBrush(ParseColor(color))) {
						graphics.FillEllipse(brush, 0, 0, MarkerSize-1, MarkerSize-1);
					}
				}

				MemoryStream ms = new MemoryStream();
				image.Save(ms, ImageFormat.Png);
				return File(ms.ToArray(), "image/png");
			}
		}
	}
}